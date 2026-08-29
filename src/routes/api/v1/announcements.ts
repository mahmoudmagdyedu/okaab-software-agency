import { createFileRoute } from "@tanstack/react-router";

import { apiData, apiError } from "@/lib/api-response.server";
import { getAnnouncements } from "@/lib/learning-platform.server";

export const Route = createFileRoute("/api/v1/announcements")({
  server: { handlers: { GET: async () => {
    try { return apiData(await getAnnouncements()); }
    catch (error) { return apiError(error, "تعذّر تحميل الإعلانات"); }
  } } },
});
