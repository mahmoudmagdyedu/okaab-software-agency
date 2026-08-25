import { createFileRoute } from "@tanstack/react-router";
import { copyEdgeResponse, invokeEdge } from "@/lib/edge-proxy.server";

export const Route = createFileRoute("/api/admin/youtube/sync")({
  server: {
    handlers: {
      POST: async ({ request }) =>
        copyEdgeResponse(await invokeEdge("okaab-admin", request, { action: "youtube_sync" })),
    },
  },
});
