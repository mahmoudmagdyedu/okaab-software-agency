import { createFileRoute } from "@tanstack/react-router";

import { runDeepHealthCheck } from "@/lib/health.server";
import { safeCompare } from "@/lib/safe-compare";

export const Route = createFileRoute("/api/internal/health/deep")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = process.env["HEALTH_MONITOR_SECRET"];
        const supplied =
          request.headers.get("x-health-secret") ||
          request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
        if (!safeCompare(expected, supplied))
          return new Response("Unauthorized", { status: 401 });
        try {
          return Response.json(await runDeepHealthCheck());
        } catch (error) {
          console.error("Scheduled health check failed", error);
          return Response.json({ error: "health_failed" }, { status: 500 });
        }
      },
    },
  },
});
