import { createFileRoute } from "@tanstack/react-router";

import { getAdminProfile } from "@/lib/admin-auth.server";

export const Route = createFileRoute("/api/admin/me")({
  server: {
    handlers: {
      GET: async () => {
        const profile = await getAdminProfile();
        return Response.json(
          { profile },
          { status: profile ? 200 : 401, headers: { "cache-control": "no-store" } },
        );
      },
    },
  },
});
