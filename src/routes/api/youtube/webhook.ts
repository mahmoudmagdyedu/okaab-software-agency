import { createFileRoute } from "@tanstack/react-router";
import { copyEdgeResponse, invokeEdge } from "@/lib/edge-proxy.server";

export const Route = createFileRoute("/api/youtube/webhook")({
  server: {
    handlers: {
      GET: async ({ request }) =>
        copyEdgeResponse(
          await invokeEdge("youtube-webhook", request, undefined, new URL(request.url).search),
        ),
      POST: async ({ request }) => copyEdgeResponse(await invokeEdge("youtube-webhook", request)),
    },
  },
});
