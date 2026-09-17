import { z } from "zod";

export const questionOptionSchema = z
  .object({
    text: z.string().trim().min(1).max(1000),
    explanation: z.string().trim().min(1).max(2000),
    correct: z.boolean(),
  })
  .strict();

export const questionSaveSchema = z
  .object({
    questionId: z.string().min(1).max(64).optional(),
    lessonId: z.string().min(1).max(64),
    text: z.string().trim().min(3).max(4000),
    level: z.enum(["easy", "medium", "apply"]),
    sortOrder: z.number().int().min(0).max(10_000),
    published: z.boolean(),
    options: z.array(questionOptionSchema).min(2).max(8),
  })
  .strict()
  .refine((value) => value.options.filter((option) => option.correct).length === 1, {
    message: "يجب تحديد إجابة صحيحة واحدة فقط",
    path: ["options"],
  });

export const lessonTaskSaveSchema = z
  .object({
    lessonId: z.string().min(1).max(64),
    enabled: z.boolean(),
    prompt: z.string().trim().max(12_000),
    requiredSlideIndex: z.number().int().min(0).max(10_000).nullable(),
  })
  .strict()
  .refine((value) => !value.enabled || value.prompt.length >= 10, {
    message: "اكتب وصفًا واضحًا للمهمة العملية",
    path: ["prompt"],
  });
