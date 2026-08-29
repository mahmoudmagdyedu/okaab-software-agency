import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { apiData, apiError } from "@/lib/api-response.server";
import { requireLearnerProfile, updateLearner } from "@/lib/learning-platform.server";

const updateSchema = z.object({
  displayName: z.string().trim().min(2).max(40).optional(),
  birthdate: z.string().date().nullable().optional(),
  leaderboardVisible: z.boolean().optional(),
});

export const Route = createFileRoute("/api/v1/me/")({
  server: { handlers: {
    GET: async () => { try { return apiData(await requireLearnerProfile()); } catch (error) { return apiError(error, "تعذّر تحميل الحساب"); } },
    PATCH: async ({ request }) => { try { return apiData(await updateLearner(updateSchema.parse(await request.json()))); } catch (error) { return apiError(error, "تعذّر تحديث الحساب"); } },
  } },
});
