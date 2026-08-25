import { createFileRoute } from "@tanstack/react-router";
import { copyEdgeResponse, invokeEdge } from "@/lib/edge-proxy.server";

export const Route = createFileRoute("/api/internal/health/deep")({
  server: {
    handlers: {
      POST: async ({ request }) =>
        copyEdgeResponse(await invokeEdge("health-monitor", request, {})),
    },
  },
});
