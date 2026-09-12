import { createFileRoute } from "@tanstack/react-router";

import { getAccountProfile } from "@/lib/admin-auth.server";
import { isAdminDashboardRole } from "@/lib/roles";

export const Route = createFileRoute("/api/account/me")({
  server: {
    handlers: {
      GET: async () => {
        const profile = await getAccountProfile();
        return Response.json(
          profile
            ? { profile, dashboard: isAdminDashboardRole(profile.role) ? "admin" : "student" }
            : { profile: null },
          { status: profile ? 200 : 401, headers: { "cache-control": "no-store" } },
        );
      },
    },
  },
});
