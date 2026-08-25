import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: () =>
        Response.json(
          {
            status: "healthy",
            service: "okaab-web",
            timestamp: new Date().toISOString(),
            version:
              process.env["HEROKU_SLUG_COMMIT"] ?? process.env["SOURCE_VERSION"] ?? "development",
            uptimeSeconds: Math.round(process.uptime()),
            memoryMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
          },
          { headers: { "cache-control": "no-store" } },
        ),
    },
  },
});
