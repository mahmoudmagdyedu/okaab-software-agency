import { createFileRoute } from "@tanstack/react-router";

import { apiData, apiError } from "@/lib/api-response.server";
import { syncLearnerAvatar } from "@/lib/learning-platform.server";

export const Route = createFileRoute("/api/v1/me/avatar")({
  server: {
    handlers: {
      POST: async () => {
        try {
          return apiData(await syncLearnerAvatar());
        } catch (error) {
          return apiError(error, "تعذّر مزامنة صورة الحساب");
        }
      },
    },
  },
});
