import { createFileRoute } from "@tanstack/react-router";
import { copyEdgeResponse, invokeEdge } from "@/lib/edge-proxy.server";

export const Route = createFileRoute("/api/admin/invite")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const input = await request.json().catch(() => ({}));
        return copyEdgeResponse(
          await invokeEdge("okaab-admin", request, { action: "invite", ...input }),
        );
      },
    },
  },
});
