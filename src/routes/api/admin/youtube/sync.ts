import { createFileRoute } from "@tanstack/react-router";

import { requireAdminProfile } from "@/lib/admin-auth.server";
import { syncYouTubeChannel } from "@/lib/youtube-sync.server";

export const Route = createFileRoute("/api/admin/youtube/sync")({
  server: {
    handlers: {
      POST: async () => {
        try {
          await requireAdminProfile(["super_admin", "admin"]);
          return Response.json(await syncYouTubeChannel());
        } catch (error) {
          if (error instanceof Response) return error;
          console.error("YouTube sync failed", error);
          return Response.json(
            { error: "تعذّرت مزامنة YouTube" },
            { status: 500 },
          );
        }
      },
    },
  },
});
