import { createFileRoute } from "@tanstack/react-router";

import { safeSecretCompare } from "@/lib/safe-secret-compare";
import { syncYouTubeChannel } from "@/lib/youtube-sync.server";

export const Route = createFileRoute("/api/internal/youtube/sync")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = process.env["HEALTH_MONITOR_SECRET"];
        const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
        // Prevent timing side-channel attacks by comparing secrets in constant time.
        if (!expected || !safeSecretCompare(supplied, expected))
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
