import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { ApiProblem, apiData, apiError } from "@/lib/api-response.server";
import { getLesson, recordLessonEvent } from "@/lib/learning-platform.server";

const schema = z.object({ idempotencyKey: z.string().min(12).max(100) });

export const Route = createFileRoute("/api/v1/lessons/$slug/complete")({
  server: { handlers: { POST: async ({ request, params }) => {
    try {
      const { idempotencyKey } = schema.parse(await request.json());
      await recordLessonEvent(params.slug, { type: "lesson_finished", idempotencyKey });
      const lesson = await getLesson(params.slug);
      if (lesson.progress?.status !== "completed") {
        throw new ApiProblem("لسه فيه جزء مطلوب في الدرس: راجع الفيديو والـSlides والأسئلة والمهمة", 409);
      }
      return apiData({ completed: true, progress: lesson.progress });
    } catch (error) {
      return apiError(error, "تعذّر إنهاء الدرس");
    }
  } } },
});
