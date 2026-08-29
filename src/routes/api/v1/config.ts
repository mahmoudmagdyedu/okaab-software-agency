import { createFileRoute } from "@tanstack/react-router";

import { apiData, apiError } from "@/lib/api-response.server";
import { getPublicConfig } from "@/lib/learning-platform.server";

export const Route = createFileRoute("/api/v1/config")({
  server: { handlers: { GET: async () => {
    try { return apiData(await getPublicConfig(), { headers: { "cache-control": "public, max-age=60" } }); }
    catch (error) { return apiError(error, "تعذّر تحميل إعدادات التطبيق"); }
  } } },
});
