import { createHmac, timingSafeEqual } from "node:crypto";
import { createFileRoute } from "@tanstack/react-router";

import { getDb, sql } from "@/lib/db.server";
import { OKAAB_CHANNEL_ID, syncYouTubeChannel } from "@/lib/youtube-sync.server";

function validSignature(body: string, signature: string | null) {
  const secret = process.env["YOUTUBE_WEBSUB_SECRET"];
  if (!secret || !signature?.startsWith("sha1=")) return false;
  const expectedBuf = Buffer.from(createHmac("sha1", secret).update(body).digest("hex"));
  const suppliedBuf = Buffer.from(signature.slice(5));
  // Security concern: Compare Buffer byte lengths before timingSafeEqual to avoid unhandled
  // ERR_CRYPTO_TIMING_SAFE_EQUAL_LENGTH exceptions and DoS when multi-byte UTF-8 chars are passed.
  return expectedBuf.length === suppliedBuf.length && timingSafeEqual(expectedBuf, suppliedBuf);
}

export const Route = createFileRoute("/api/youtube/webhook")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const challenge = url.searchParams.get("hub.challenge");
        const topic = url.searchParams.get("hub.topic") || "";
        if (!challenge || !topic.includes(OKAAB_CHANNEL_ID))
          return new Response("Bad request", { status: 400 });
        return new Response(challenge, { headers: { "content-type": "text/plain" } });
      },
      POST: async ({ request }) => {
        const body = await request.text();
        if (!validSignature(body, request.headers.get("x-hub-signature")))
          return new Response("Unauthorized", { status: 401 });
        const pool = await getDb();
        await pool
          .request()
          .input("channel", sql.NVarChar(128), OKAAB_CHANNEL_ID)
          .query(
            "update okaab.youtube_sync_state set last_webhook_at=sysutcdatetime(),updated_at=sysutcdatetime() where channel_id=@channel",
          );
        setTimeout(
          () =>
            void syncYouTubeChannel().catch((error) =>
              console.error("WebSub reconciliation failed", error),
            ),
          0,
        );
        return new Response(null, { status: 204 });
      },
    },
  },
});
