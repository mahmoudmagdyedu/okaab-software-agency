import { createFileRoute } from "@tanstack/react-router";

import { apiData, apiError } from "@/lib/api-response.server";
import { getQuiz } from "@/lib/learning-platform.server";

export const Route = createFileRoute("/api/v1/lessons/$slug/quiz")({
  server: { handlers: { GET: async ({ params }) => {
    try { return apiData(await getQuiz(params.slug)); }
    catch (error) { return apiError(error, "تعذّر تحميل الأسئلة"); }
  } } },
});
