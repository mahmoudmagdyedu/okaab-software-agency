import { createFileRoute } from "@tanstack/react-router";
import { copyEdgeResponse, invokeEdge } from "@/lib/edge-proxy.server";

export const Route = createFileRoute("/api/admin/health/run")({
  server: {
    handlers: {
      POST: async ({ request }) =>
        copyEdgeResponse(await invokeEdge("okaab-admin", request, { action: "health_run" })),
    },
  },
});
