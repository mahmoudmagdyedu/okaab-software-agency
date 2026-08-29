import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { apiData, apiError } from "@/lib/api-response.server";
import { answerQuiz } from "@/lib/learning-platform.server";

const schema = z.object({
  questionId: z.string().min(1).max(64),
  optionId: z.string().min(1).max(64),
  idempotencyKey: z.string().min(12).max(100),
});

export const Route = createFileRoute("/api/v1/quiz/answers")({
  server: { handlers: { POST: async ({ request }) => {
    try { return apiData(await answerQuiz(schema.parse(await request.json()))); }
    catch (error) { return apiError(error, "تعذّر تسجيل الإجابة"); }
  } } },
});
