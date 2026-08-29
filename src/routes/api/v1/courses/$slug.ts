import { createFileRoute } from "@tanstack/react-router";

import { apiData, apiError } from "@/lib/api-response.server";
import { getCourse } from "@/lib/learning-platform.server";

export const Route = createFileRoute("/api/v1/courses/$slug")({
  server: { handlers: { GET: async ({ params }) => {
    try { return apiData(await getCourse(params.slug)); }
    catch (error) { return apiError(error, "تعذّر تحميل الكورس"); }
  } } },
});
