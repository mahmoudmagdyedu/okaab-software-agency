import { createFileRoute } from "@tanstack/react-router";

import { apiData, apiError } from "@/lib/api-response.server";
import { getCatalog } from "@/lib/learning-platform.server";

export const Route = createFileRoute("/api/v1/catalog")({
  server: { handlers: { GET: async () => {
    try { return apiData(await getCatalog(), { headers: { "cache-control": "public, max-age=60, stale-while-revalidate=300" } }); }
    catch (error) { return apiError(error, "تعذّر تحميل الكتالوج"); }
  } } },
});
