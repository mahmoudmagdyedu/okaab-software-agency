import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { apiData, apiError } from "@/lib/api-response.server";
import { getLesson, getLessonCompletion, recordLessonEvent } from "@/lib/learning-platform.server";

const schema = z.object({ idempotencyKey: z.string().min(12).max(100) });

export const Route = createFileRoute("/api/v1/lessons/$slug/complete")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        try {
          const { idempotencyKey } = schema.parse(await request.json());
          await recordLessonEvent(params.slug, { type: "lesson_finished", idempotencyKey });
          const completion = await getLessonCompletion(params.slug);
          if (!completion.completed) {
            const labels = {
              video: "شاهد 85% من الفيديو على الأقل",
              slides: "أكمل الشرائح المطلوبة",
              quiz: "أكمل الاختبار",
              task: "اجتز المهمة المطلوبة",
            };
            return Response.json(
              {
                data: null,
                error: {
                  code: "LESSON_REQUIREMENTS_INCOMPLETE",
                  message: completion.missing.map((key) => labels[key]).join(" · "),
                  missing: completion.missing,
                  requirements: completion.requirements,
                },
              },
              { status: 409, headers: { "cache-control": "no-store" } },
            );
          }
          const lesson = await getLesson(params.slug);
          return apiData({
            completed: true,
            progress: lesson.progress,
            requirements: completion.requirements,
          });
        } catch (error) {
          return apiError(error, "تعذّر إنهاء الدرس");
        }
      },
    },
  },
});
