import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { apiData, apiError } from "@/lib/api-response.server";
import { registerDevice, unregisterDevice } from "@/lib/learning-platform.server";

const schema = z.object({
  token: z.string().min(20).max(500),
  platform: z.enum(["android", "ios"]),
  appVersion: z.string().min(1).max(40),
});

export const Route = createFileRoute("/api/v1/devices")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          return apiData(await registerDevice(schema.parse(await request.json())));
        } catch (error) {
          return apiError(error, "تعذّر تسجيل الجهاز");
        }
      },
      DELETE: async ({ request }) => {
        try {
          const { token } = schema.pick({ token: true }).parse(await request.json());
          return apiData(await unregisterDevice(token));
        } catch (error) {
          return apiError(error, "تعذّر إيقاف إشعارات الجهاز");
        }
      },
    },
  },
});
