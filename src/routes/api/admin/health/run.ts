import { createFileRoute } from "@tanstack/react-router";

import { requireAdminProfile } from "@/lib/admin-auth.server";
import { runDeepHealthCheck } from "@/lib/health.server";

export const Route = createFileRoute("/api/admin/health/run")({
  server: {
    handlers: {
      POST: async () => {
        try {
          await requireAdminProfile(["super_admin", "admin"]);
          return Response.json(await runDeepHealthCheck());
        } catch (error) {
          if (error instanceof Response) return error;
          console.error("Health run failed", error);
          return Response.json({ error: "تعذّر إكمال الفحص" }, { status: 500 });
        }
      },
    },
  },
});
