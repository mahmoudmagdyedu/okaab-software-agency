import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { apiData, apiError } from "@/lib/api-response.server";
import { recordLessonEvent } from "@/lib/learning-platform.server";

const schema = z.object({
  type: z.enum(["slide_changed", "video_progress", "quiz_finished", "task_result", "lesson_finished"]),
  idempotencyKey: z.string().min(12).max(100),
  index: z.number().int().min(0).max(10000).optional(),
  percent: z.number().min(0).max(100).optional(),
  score: z.number().min(0).max(100).optional(),
  passed: z.boolean().optional(),
});

export const Route = createFileRoute("/api/v1/lessons/$slug/events")({
  server: { handlers: { POST: async ({ request, params }) => {
    try { return apiData(await recordLessonEvent(params.slug, schema.parse(await request.json()))); }
    catch (error) { return apiError(error, "تعذّر حفظ تقدّمك"); }
  } } },
});
