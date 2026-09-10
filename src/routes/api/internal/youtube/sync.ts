import { timingSafeEqual } from "node:crypto";
import { createFileRoute } from "@tanstack/react-router";

import { syncYouTubeChannel } from "@/lib/youtube-sync.server";

function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

export const Route = createFileRoute("/api/internal/youtube/sync")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = process.env["HEALTH_MONITOR_SECRET"];
        const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
        if (!expected || !supplied || !safeCompare(supplied, expected))
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
