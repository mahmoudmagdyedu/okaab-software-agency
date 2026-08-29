import { createFileRoute } from "@tanstack/react-router";

import { apiData, apiError } from "@/lib/api-response.server";
import { getOverview } from "@/lib/learning-platform.server";

export const Route = createFileRoute("/api/v1/me/overview")({
  server: { handlers: { GET: async () => {
    try { return apiData(await getOverview()); }
    catch (error) { return apiError(error, "تعذّر تحميل ملخصك"); }
  } } },
});
