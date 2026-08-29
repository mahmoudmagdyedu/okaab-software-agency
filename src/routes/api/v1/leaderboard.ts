import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { apiData, apiError } from "@/lib/api-response.server";
import { getLeaderboard } from "@/lib/learning-platform.server";

export const Route = createFileRoute("/api/v1/leaderboard")({
  server: { handlers: { GET: async ({ request }) => {
    try {
      const period = z.enum(["weekly", "monthly", "all"]).catch("weekly").parse(new URL(request.url).searchParams.get("period"));
      return apiData(await getLeaderboard(period));
    } catch (error) { return apiError(error, "تعذّر تحميل لوحة المتصدرين"); }
  } } },
});
