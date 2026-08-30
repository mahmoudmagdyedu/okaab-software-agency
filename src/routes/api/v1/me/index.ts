import { createFileRoute } from "@tanstack/react-router";
import { auth } from "@clerk/tanstack-react-start/server";
import { z } from "zod";

import { ApiProblem, apiData, apiError } from "@/lib/api-response.server";
import { deleteLearner, requireLearnerProfile, updateLearner } from "@/lib/learning-platform.server";

const updateSchema = z.object({
  displayName: z.string().trim().min(2).max(40).optional(),
  birthdate: z.string().date().nullable().optional().refine((value) => !value || new Date(value) <= new Date(new Date().setFullYear(new Date().getFullYear() - 13)), "يجب ألا يقل العمر عن 13 سنة"),
  leaderboardVisible: z.boolean().optional(),
});

export const Route = createFileRoute("/api/v1/me/")({
  server: { handlers: {
    GET: async () => { try { return apiData(await requireLearnerProfile()); } catch (error) { return apiError(error, "تعذّر تحميل الحساب"); } },
    PATCH: async ({ request }) => { try { return apiData(await updateLearner(updateSchema.parse(await request.json()))); } catch (error) { return apiError(error, "تعذّر تحديث الحساب"); } },
    DELETE: async ({ request }) => {
      try {
        const authState = await auth();
        if (!authState.has({ reverification: { level: "first_factor", afterMinutes: 10 } })) {
          throw new ApiProblem("أدخل رمز التحقق المرسل إلى بريدك قبل حذف الحساب", 403);
        }
        const input = z.object({ confirmation: z.literal("احذف حسابي") }).parse(await request.json());
        void input;
        return apiData(await deleteLearner());
      } catch (error) {
        return apiError(error, "تعذّر حذف الحساب");
      }
    },
  } },
});
