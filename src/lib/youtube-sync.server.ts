import { getDb, sql } from "@/lib/db.server";

export const OKAAB_CHANNEL_ID = "UCBAEq8qb5_yvj6_Ef96agOg";
const API_ROOT = "https://www.googleapis.com/youtube/v3";

type Snippet = {
  title?: string;
  description?: string;
  publishedAt?: string;
  resourceId?: { videoId?: string };
  thumbnails?: Record<string, { url?: string }>;
};
type PlaylistItem = {
  snippet?: Snippet;
  contentDetails?: { videoId?: string; videoPublishedAt?: string };
};
type Channel = {
  snippet?: { title?: string };
  contentDetails?: { relatedPlaylists?: { uploads?: string } };
};
type Playlist = { id: string; snippet?: Snippet };
type Video = { id: string; snippet?: Snippet; status?: { privacyStatus?: string } };

async function youtube<T>(path: string, params: Record<string, string>) {
  const key = process.env["YOUTUBE_API_KEY"];
  if (!key) throw new Error("YOUTUBE_API_KEY غير موجود في Heroku Config Vars");
  const url = new URL(`${API_ROOT}/${path}`);
  Object.entries({ ...params, key }).forEach(([name, value]) => url.searchParams.set(name, value));
  const response = await fetch(url, { signal: AbortSignal.timeout(20_000) });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    // A brand-new channel can expose an uploads playlist ID before YouTube has
    // created the playlist itself. Treat that documented 404 as an empty page
    // so the sync still records a successful, zero-video result.
    if (
      response.status === 404 &&
      path === "playlistItems" &&
      body.includes("playlistNotFound")
    ) {
      return { items: [] };
    }
    throw new Error(
      `YouTube API ${response.status}${body.includes("quota") ? " — انتهت الحصة اليومية" : ""}`,
    );
  }
  return response.json() as Promise<{ items?: T[]; nextPageToken?: string }>;
}

async function allPages<T>(path: string, params: Record<string, string>) {
  const items: T[] = [];
  let pageToken = "";
  do {
    const page = await youtube<T>(path, { ...params, ...(pageToken ? { pageToken } : {}) });
    items.push(...(page.items || []));
    pageToken = page.nextPageToken || "";
  } while (pageToken);
  return items;
}

function thumbnail(snippet?: Snippet) {
  return (
    snippet?.thumbnails?.["maxres"]?.url ||
    snippet?.thumbnails?.["standard"]?.url ||
    snippet?.thumbnails?.["high"]?.url ||
    snippet?.thumbnails?.["medium"]?.url ||
    snippet?.thumbnails?.["default"]?.url ||
    null
  );
}

export async function subscribeYouTubeWebSub() {
  const secret = process.env["YOUTUBE_WEBSUB_SECRET"];
  if (!secret) return { subscribed: false, reason: "missing_secret" };
  const body = new URLSearchParams({
    "hub.callback": `${process.env["PUBLIC_SITE_URL"] || "https://okaab.org"}/api/youtube/webhook`,
    "hub.topic": `https://www.youtube.com/feeds/videos.xml?channel_id=${OKAAB_CHANNEL_ID}`,
    "hub.verify": "async",
    "hub.mode": "subscribe",
    "hub.lease_seconds": "864000",
    "hub.secret": secret,
  });
  const response = await fetch("https://pubsubhubbub.appspot.com/subscribe", {
    method: "POST",
    body,
    signal: AbortSignal.timeout(15_000),
  });
  if (![200, 202, 204].includes(response.status)) throw new Error(`WebSub ${response.status}`);
  return { subscribed: true };
}

export async function syncYouTubeChannel() {
  const attemptedAt = new Date();
  const pool = await getDb();
  await pool
    .request()
    .input("channel", sql.NVarChar(128), OKAAB_CHANNEL_ID)
    .query(
      "update okaab.youtube_sync_state set last_attempt_at=sysutcdatetime(),updated_at=sysutcdatetime() where channel_id=@channel",
    );
  try {
    const channelData = await youtube<Channel>("channels", {
      part: "snippet,contentDetails",
      id: OKAAB_CHANNEL_ID,
    });
    const channel = channelData.items?.[0];
    const uploads = channel?.contentDetails?.relatedPlaylists?.uploads;
    if (!channel || !uploads) throw new Error("تعذّر العثور على قناة Okaab أو قائمة الرفع");

    const playlists = await allPages<Playlist>("playlists", {
      part: "snippet",
      channelId: OKAAB_CHANNEL_ID,
      maxResults: "50",
    });
    for (const playlist of playlists) {
      await pool
        .request()
        .input("yt", sql.NVarChar(128), playlist.id)
        .input("title", sql.NVarChar(300), playlist.snippet?.title || "YouTube Playlist")
        .input("thumb", sql.NVarChar(1000), thumbnail(playlist.snippet))
        .query(`merge okaab.course_playlists as target using (select @yt as youtube_playlist_id) as source on target.youtube_playlist_id=source.youtube_playlist_id
          when matched then update set title=@title,thumbnail_url=@thumb,last_synced_at=sysutcdatetime(),updated_at=sysutcdatetime()
          when not matched then insert (youtube_playlist_id,title,thumbnail_url,last_synced_at) values (@yt,@title,@thumb,sysutcdatetime());`);
    }
    const playlistRows = await pool
      .request()
      .query<{ id: string; youtube_playlist_id: string; course_id: string | null }>(
        "select id,youtube_playlist_id,course_id from okaab.course_playlists",
      );
    const playlistMap = new Map(
      playlistRows.recordset.map((row) => [row.youtube_playlist_id, row]),
    );

    const assigned = new Map<string, { playlistId: string; courseId: string }>();
    const items = new Map<string, PlaylistItem>();
    for (const playlist of playlists) {
      const playlistItems = await allPages<PlaylistItem>("playlistItems", {
        part: "snippet,contentDetails",
        playlistId: playlist.id,
        maxResults: "50",
      });
      const mapped = playlistMap.get(playlist.id);
      for (const item of playlistItems) {
        const id = item.contentDetails?.videoId || item.snippet?.resourceId?.videoId;
        if (!id) continue;
        items.set(id, item);
        if (mapped?.course_id && !assigned.has(id))
          assigned.set(id, { playlistId: mapped.id, courseId: mapped.course_id });
      }
    }
    const uploadsItems = await allPages<PlaylistItem>("playlistItems", {
      part: "snippet,contentDetails",
      playlistId: uploads,
      maxResults: "50",
    });
    uploadsItems.forEach((item) => {
      const id = item.contentDetails?.videoId || item.snippet?.resourceId?.videoId;
      if (id) items.set(id, item);
    });

    const ids = [...items.keys()];
    const details = new Map<string, Video>();
    for (let index = 0; index < ids.length; index += 50) {
      const page = await youtube<Video>("videos", {
        part: "snippet,status",
        id: ids.slice(index, index + 50).join(","),
        maxResults: "50",
      });
      (page.items || []).forEach((video) => details.set(video.id, video));
    }
    const existingRows = await pool.request().query<{
      youtube_video_id: string;
      playlist_id: string | null;
      course_id: string | null;
      lesson_id: string | null;
      sort_order: number;
    }>("select youtube_video_id,playlist_id,course_id,lesson_id,sort_order from okaab.youtube_videos");
    const existing = new Map(existingRows.recordset.map((row) => [row.youtube_video_id, row]));
    for (const id of ids) {
      const item = items.get(id)!;
      const detail = details.get(id);
      const old = existing.get(id);
      const mapped = assigned.get(id);
      const snippet = detail?.snippet || item.snippet;
      await pool
        .request()
        .input("yt", sql.NVarChar(64), id)
        .input("playlist", sql.NVarChar(64), mapped?.playlistId || old?.playlist_id || null)
        .input("course", sql.NVarChar(64), mapped?.courseId || old?.course_id || null)
        .input("lesson", sql.NVarChar(64), old?.lesson_id || null)
        .input("title", sql.NVarChar(500), snippet?.title || "فيديو من عُقاب")
        .input("description", sql.NVarChar(sql.MAX), snippet?.description || "")
        .input("thumb", sql.NVarChar(1000), thumbnail(snippet))
        .input(
          "published",
          sql.DateTimeOffset,
          snippet?.publishedAt
            ? new Date(snippet.publishedAt)
            : item.contentDetails?.videoPublishedAt
              ? new Date(item.contentDetails.videoPublishedAt)
              : null,
        )
        .input("sort", sql.Int, old?.sort_order || 0)
        .input("available", sql.Bit, Boolean(detail) && detail?.status?.privacyStatus === "public")
        .query(`merge okaab.youtube_videos as target using (select @yt as youtube_video_id) as source on target.youtube_video_id=source.youtube_video_id
          when matched then update set playlist_id=@playlist,course_id=@course,lesson_id=@lesson,title=@title,description=@description,thumbnail_url=@thumb,published_at=@published,sort_order=@sort,is_available=@available,last_synced_at=sysutcdatetime(),updated_at=sysutcdatetime()
          when not matched then insert (youtube_video_id,playlist_id,course_id,lesson_id,title,description,thumbnail_url,published_at,sort_order,is_available,last_synced_at) values (@yt,@playlist,@course,@lesson,@title,@description,@thumb,@published,@sort,@available,sysutcdatetime());`);
    }
    await pool
      .request()
      .input("channel", sql.NVarChar(128), OKAAB_CHANNEL_ID)
      .input("title", sql.NVarChar(300), channel.snippet?.title || "Okaab")
      .query(
        "update okaab.youtube_sync_state set channel_title=@title,last_success_at=sysutcdatetime(),last_error_code=null,last_error_summary=null,consecutive_failures=0,updated_at=sysutcdatetime() where channel_id=@channel",
      );
    await subscribeYouTubeWebSub().catch((error) =>
      console.warn("WebSub subscription failed", error),
    );
    return { videos: ids.length, playlists: playlists.length, syncedAt: attemptedAt.toISOString() };
  } catch (error) {
    await pool
      .request()
      .input("channel", sql.NVarChar(128), OKAAB_CHANNEL_ID)
      .input(
        "summary",
        sql.NVarChar(1000),
        error instanceof Error ? error.message.slice(0, 1000) : "Unknown sync error",
      )
      .query(
        "update okaab.youtube_sync_state set last_error_code='sync_failed',last_error_summary=@summary,consecutive_failures=consecutive_failures+1,updated_at=sysutcdatetime() where channel_id=@channel",
      );
    throw error;
  }
}
