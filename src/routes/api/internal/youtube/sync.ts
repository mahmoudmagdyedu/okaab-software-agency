import { timingSafeEqual } from "node:crypto";
import { createFileRoute } from "@tanstack/react-router";

import { syncYouTubeChannel } from "@/lib/youtube-sync.server";

export const Route = createFileRoute("/api/internal/youtube/sync")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = process.env["HEALTH_MONITOR_SECRET"];
        const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
        // Prevent timing attacks by comparing Buffer lengths and using timingSafeEqual
        if (
          !expected ||
          !supplied ||
          Buffer.from(supplied).length !== Buffer.from(expected).length ||
          !timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))
        )
          return new Response("Unauthorized", { status: 401 });
        try {
          return Response.json(await syncYouTubeChannel());
        } catch (error) {
          console.error("Scheduled YouTube sync failed", error);
          return Response.json({ error: "sync_failed" }, { status: 500 });
        }
      },
    },
  },
});
