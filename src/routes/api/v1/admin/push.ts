import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { apiData, apiError } from "@/lib/api-response.server";
import { requireAdminProfile } from "@/lib/admin-auth.server";
import { sendLearningPush } from "@/lib/push-notifications.server";

const schema = z.object({
  title: z.string().trim().min(3).max(100),
  body: z.string().trim().min(3).max(500),
  audience: z.enum(["all", "active", "inactive_7d"]),
});

export const Route = createFileRoute("/api/v1/admin/push")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const actor = await requireAdminProfile(["super_admin", "admin"]);
          const input = schema.parse(await request.json());
          return apiData(await sendLearningPush({ actorId: actor.id, ...input }));
        } catch (error) {
          return apiError(error, "تعذّر إرسال الإشعار");
        }
      },
    },
  },
});
