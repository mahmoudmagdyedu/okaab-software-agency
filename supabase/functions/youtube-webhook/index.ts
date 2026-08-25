import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { OKAAB_CHANNEL_ID, serviceClient } from "../_shared/youtube.ts";

function xmlValue(xml: string, tag: string) {
  return (
    xml
      .match(
        new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, "i"),
      )?.[1]
      ?.trim() ?? null
  );
}
async function validSignature(body: string, signature: string | null, secret: string) {
  if (!signature?.startsWith("sha1=")) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"],
  );
  const digest = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body)),
  );
  const expected = [...digest].map((value) => value.toString(16).padStart(2, "0")).join("");
  const supplied = signature.slice(5).toLowerCase();
  if (supplied.length !== expected.length) return false;
  let different = 0;
  for (let i = 0; i < expected.length; i += 1)
    different |= expected.charCodeAt(i) ^ supplied.charCodeAt(i);
  return different === 0;
}

Deno.serve(async (request: Request) => {
  if (request.method === "GET") {
    const url = new URL(request.url);
    const challenge = url.searchParams.get("hub.challenge");
    const topic = url.searchParams.get("hub.topic") ?? "";
    if (!challenge || !topic.includes(`channel_id=${OKAAB_CHANNEL_ID}`))
      return new Response("Invalid challenge", { status: 400 });
    return new Response(challenge, { headers: { "content-type": "text/plain; charset=utf-8" } });
  }
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const body = await request.text();
  const secret = Deno.env.get("YOUTUBE_WEBSUB_SECRET");
  if (!secret || !(await validSignature(body, request.headers.get("x-hub-signature"), secret)))
    return new Response("Invalid signature", { status: 401 });
  const channelId = xmlValue(body, "yt:channelId");
  if (channelId && channelId !== OKAAB_CHANNEL_ID)
    return new Response("Wrong channel", { status: 400 });
  const admin = serviceClient();
  const deleted = body.match(/<at:deleted-entry[^>]+ref=["']yt:video:([^"']+)["']/i)?.[1];
  const now = new Date().toISOString();
  if (deleted)
    await admin
      .from("youtube_videos")
      .update({ is_available: false, last_synced_at: now })
      .eq("youtube_video_id", deleted);
  else {
    const videoId = xmlValue(body, "yt:videoId");
    if (videoId)
      await admin.from("youtube_videos").upsert(
        {
          youtube_video_id: videoId,
          title: xmlValue(body, "title") || "فيديو جديد من عُقاب",
          description: "",
          thumbnail_url: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          published_at: xmlValue(body, "published"),
          is_available: true,
          last_synced_at: now,
        },
        { onConflict: "youtube_video_id" },
      );
  }
  await admin
    .from("youtube_sync_state")
    .update({ last_webhook_at: now })
    .eq("channel_id", OKAAB_CHANNEL_ID);
  return new Response("Accepted", { status: 202 });
});
