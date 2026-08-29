import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { apiData, apiError } from "@/lib/api-response.server";
import { gradeLessonTask } from "@/lib/learning-platform.server";

const schema = z.object({
  submission: z.string().trim().min(10).max(20_000),
  idempotencyKey: z.string().min(12).max(100),
});

export const Route = createFileRoute("/api/v1/lessons/$slug/task/grade")({
  server: { handlers: { POST: async ({ request, params }) => {
    try {
      const input = schema.parse(await request.json());
      return apiData(await gradeLessonTask(params.slug, input.submission, input.idempotencyKey));
    } catch (error) {
      return apiError(error, "تعذّر تصحيح المهمة");
    }
  } } },
});
