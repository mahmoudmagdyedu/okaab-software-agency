import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { ApiProblem, apiData, apiError } from "@/lib/api-response.server";
import { recordLessonEvent } from "@/lib/learning-platform.server";

const legacyEventSchema = z.object({
  type: z.enum([
    "slide_changed",
    "video_progress",
    "quiz_finished",
    "task_result",
    "lesson_finished",
  ]),
  idempotencyKey: z.string().min(12).max(100),
  index: z.number().int().min(0).max(10000).optional(),
  percent: z.number().min(0).max(100).optional(),
  score: z.number().min(0).max(100).optional(),
  passed: z.boolean().optional(),
});

const completedQuizSchema = z
  .object({
    type: z.literal("quiz_completed"),
    idempotencyKey: z.string().min(12).max(100).optional(),
    attemptId: z
      .string()
      .min(12)
      .max(64)
      .regex(/^[a-zA-Z0-9-]+$/),
    deckId: z.string().min(1).max(64),
    courseSlug: z.string().min(1).max(180),
    lessonSlug: z.string().min(1).max(180),
    lessonNumber: z.number().int().min(0).max(10000),
    questionSetVersion: z.string().min(8).max(128),
    correctAnswers: z.number().int().min(0).max(1000),
    totalQuestions: z.number().int().min(1).max(1000),
    scorePercent: z.number().int().min(0).max(100),
    completedAt: z.string().datetime({ offset: true }),
  })
  .superRefine((event, context) => {
    if (event.correctAnswers > event.totalQuestions) {
      context.addIssue({
        code: "custom",
        path: ["correctAnswers"],
        message: "عدد الإجابات الصحيحة غير صالح",
      });
    }
    const expected = Math.round((event.correctAnswers / event.totalQuestions) * 100);
    if (event.scorePercent !== expected) {
      context.addIssue({
        code: "custom",
        path: ["scorePercent"],
        message: "نسبة الدرجة لا تطابق الإجابات",
      });
    }
  });

const schema = z.union([legacyEventSchema, completedQuizSchema]);

export const Route = createFileRoute("/api/v1/lessons/$slug/events")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        try {
          const event = schema.parse(await request.json());
          if (event.type !== "quiz_completed")
            return apiData(await recordLessonEvent(params.slug, event));

          if (event.lessonSlug !== params.slug)
            throw new ApiProblem("معرّف الدرس لا يطابق الرابط", 422);
          const expectedKey = `quiz:${event.attemptId}`;
          const suppliedKey = request.headers.get("idempotency-key") ?? event.idempotencyKey;
          if (suppliedKey !== expectedKey) throw new ApiProblem("مفتاح منع التكرار غير صالح", 422);
          return apiData(
            await recordLessonEvent(params.slug, { ...event, idempotencyKey: expectedKey }),
          );
        } catch (error) {
          return apiError(error, "تعذّر حفظ تقدّمك");
        }
      },
    },
  },
});
