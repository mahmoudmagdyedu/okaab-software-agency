import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";

export const OKAAB_CHANNEL_ID = "UCBAEq8qb5_yvj6_Ef96agOg";
const API_ROOT = "https://www.googleapis.com/youtube/v3";

type PlaylistItem = {
  snippet?: {
    title?: string;
    description?: string;
    publishedAt?: string;
    playlistId?: string;
    resourceId?: { videoId?: string };
    thumbnails?: Record<string, { url?: string }>;
  };
  contentDetails?: { videoId?: string; videoPublishedAt?: string };
};

type YouTubeSnippet = NonNullable<PlaylistItem["snippet"]>;
type YouTubeChannel = {
  snippet?: { title?: string };
  contentDetails?: { relatedPlaylists?: { uploads?: string } };
};
type YouTubePlaylist = { id: string; snippet?: YouTubeSnippet };
type YouTubeVideoDetail = {
  id: string;
  snippet?: YouTubeSnippet;
  status?: { privacyStatus?: string };
};

async function youtube<T>(path: string, params: Record<string, string>) {
  const key = process.env["YOUTUBE_API_KEY"];
  if (!key) throw new Error("YOUTUBE_API_KEY is not configured");
  const url = new URL(`${API_ROOT}/${path}`);
  for (const [name, value] of Object.entries({ ...params, key })) url.searchParams.set(name, value);
  const response = await fetch(url, { signal: AbortSignal.timeout(20_000) });
  if (!response.ok) throw new Error(`YouTube API ${response.status}`);
  return response.json() as Promise<{ items?: T[]; nextPageToken?: string }>;
}

async function allPages<T>(path: string, params: Record<string, string>) {
  const items: T[] = [];
  let pageToken = "";
  do {
    const page = await youtube<T>(path, { ...params, ...(pageToken ? { pageToken } : {}) });
    items.push(...(page.items ?? []));
    pageToken = page.nextPageToken ?? "";
  } while (pageToken);
  return items;
}

function thumbnail(snippet?: PlaylistItem["snippet"]) {
  return (
    snippet?.thumbnails?.["maxres"]?.url ??
    snippet?.thumbnails?.["standard"]?.url ??
    snippet?.thumbnails?.["high"]?.url ??
    snippet?.thumbnails?.["medium"]?.url ??
    snippet?.thumbnails?.["default"]?.url ??
    null
  );
}

export async function subscribeYouTubeWebSub() {
  const secret = process.env["YOUTUBE_WEBSUB_SECRET"];
  if (!secret) return { subscribed: false, reason: "missing_secret" };
  const body = new URLSearchParams({
    "hub.callback": "https://okaab.org/api/youtube/webhook",
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
  if (!response.ok && response.status !== 202 && response.status !== 204)
    throw new Error(`WebSub ${response.status}`);
  return { subscribed: true };
}

export async function syncYouTubeChannel(admin: SupabaseClient<Database>) {
  const attemptedAt = new Date().toISOString();
  await admin
    .from("youtube_sync_state")
    .update({ last_attempt_at: attemptedAt })
    .eq("channel_id", OKAAB_CHANNEL_ID);
  try {
    const channelData = await youtube<YouTubeChannel>("channels", {
      part: "snippet,contentDetails",
      id: OKAAB_CHANNEL_ID,
    });
    const channel = channelData.items?.[0];
    if (!channel) throw new Error("YouTube channel was not found");
    const uploadsPlaylistId = channel.contentDetails?.relatedPlaylists?.uploads;
    if (!uploadsPlaylistId) throw new Error("Uploads playlist was not found");

    const playlists = await allPages<YouTubePlaylist>("playlists", {
      part: "snippet",
      channelId: OKAAB_CHANNEL_ID,
      maxResults: "50",
    });
    if (playlists.length) {
      const playlistResult = await admin.from("course_playlists").upsert(
        playlists.map((playlist) => ({
          youtube_playlist_id: playlist.id,
          title: playlist.snippet?.title || "YouTube Playlist",
          thumbnail_url: thumbnail(playlist.snippet),
          last_synced_at: attemptedAt,
        })),
        { onConflict: "youtube_playlist_id" },
      );
      if (playlistResult.error) throw playlistResult.error;
    }

    const playlistRows = await admin.from("course_playlists").select("*");
    if (playlistRows.error) throw playlistRows.error;
    const playlistMap = new Map(
      (playlistRows.data ?? []).map((row) => [row.youtube_playlist_id, row]),
    );

    const assignedVideo = new Map<string, { playlistDbId: string; courseId: string }>();
    const itemsByVideo = new Map<string, PlaylistItem>();
    for (const playlist of playlists) {
      const items = await allPages<PlaylistItem>("playlistItems", {
        part: "snippet,contentDetails",
        playlistId: playlist.id,
        maxResults: "50",
      });
      const mapped = playlistMap.get(playlist.id);
      for (const item of items) {
        const videoId = item.contentDetails?.videoId ?? item.snippet?.resourceId?.videoId;
        if (!videoId) continue;
        itemsByVideo.set(videoId, item);
        if (mapped?.course_id && !assignedVideo.has(videoId))
          assignedVideo.set(videoId, { playlistDbId: mapped.id, courseId: mapped.course_id });
      }
    }

    const uploadItems = await allPages<PlaylistItem>("playlistItems", {
      part: "snippet,contentDetails",
      playlistId: uploadsPlaylistId,
      maxResults: "50",
    });
    for (const item of uploadItems) {
      const videoId = item.contentDetails?.videoId ?? item.snippet?.resourceId?.videoId;
      if (videoId) itemsByVideo.set(videoId, item);
    }

    const videoIds = [...itemsByVideo.keys()];
    const details = new Map<string, YouTubeVideoDetail>();
    for (let index = 0; index < videoIds.length; index += 50) {
      const batch = await youtube<YouTubeVideoDetail>("videos", {
        part: "snippet,contentDetails,status",
        id: videoIds.slice(index, index + 50).join(","),
        maxResults: "50",
      });
      for (const item of batch.items ?? []) details.set(item.id, item);
    }

    const existing = videoIds.length
      ? await admin
          .from("youtube_videos")
          .select("youtube_video_id,course_id,playlist_id,lesson_id,sort_order")
          .in("youtube_video_id", videoIds)
      : { data: [], error: null };
    if (existing.error) throw existing.error;
    const existingMap = new Map((existing.data ?? []).map((row) => [row.youtube_video_id, row]));
    const rows = videoIds.map((videoId) => {
      const item = itemsByVideo.get(videoId)!;
      const detail = details.get(videoId);
      const current = existingMap.get(videoId);
      const mapped = assignedVideo.get(videoId);
      const snippet = detail?.snippet ?? item.snippet;
      return {
        youtube_video_id: videoId,
        playlist_id: mapped?.playlistDbId ?? current?.playlist_id ?? null,
        course_id: mapped?.courseId ?? current?.course_id ?? null,
        lesson_id: current?.lesson_id ?? null,
        title: snippet?.title || "فيديو من عُقاب",
        description: snippet?.description || "",
        thumbnail_url: thumbnail(snippet),
        published_at:
          detail?.snippet?.publishedAt ??
          item.contentDetails?.videoPublishedAt ??
          item.snippet?.publishedAt ??
          null,
        sort_order: current?.sort_order ?? 0,
        is_available: Boolean(detail) && detail?.status?.privacyStatus === "public",
        last_synced_at: attemptedAt,
      };
    });
    if (rows.length) {
      const saved = await admin
        .from("youtube_videos")
        .upsert(rows, { onConflict: "youtube_video_id" });
      if (saved.error) throw saved.error;
    }

    await admin
      .from("youtube_sync_state")
      .update({
        channel_title: channel.snippet?.title ?? "Okaab",
        last_success_at: attemptedAt,
        last_error_code: null,
        last_error_summary: null,
        consecutive_failures: 0,
      })
      .eq("channel_id", OKAAB_CHANNEL_ID);
    await subscribeYouTubeWebSub();
    return { videos: rows.length, playlists: playlists.length, syncedAt: attemptedAt };
  } catch (error) {
    const current = await admin
      .from("youtube_sync_state")
      .select("consecutive_failures")
      .eq("channel_id", OKAAB_CHANNEL_ID)
      .maybeSingle();
    await admin
      .from("youtube_sync_state")
      .update({
        last_error_code: "sync_failed",
        last_error_summary:
          error instanceof Error ? error.message.slice(0, 300) : "Unknown sync error",
        consecutive_failures: (current.data?.consecutive_failures ?? 0) + 1,
      })
      .eq("channel_id", OKAAB_CHANNEL_ID);
    throw error;
  }
}
