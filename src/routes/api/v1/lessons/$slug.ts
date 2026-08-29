import { createFileRoute } from "@tanstack/react-router";

import { apiData, apiError } from "@/lib/api-response.server";
import { getLesson } from "@/lib/learning-platform.server";

export const Route = createFileRoute("/api/v1/lessons/$slug")({
  server: { handlers: { GET: async ({ params }) => {
    try { return apiData(await getLesson(params.slug)); }
    catch (error) { return apiError(error, "تعذّر تحميل الدرس"); }
  } } },
});
