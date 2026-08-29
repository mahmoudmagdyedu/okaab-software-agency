import { createFileRoute } from "@tanstack/react-router";

const paths = {
  "/api/v1/catalog": { get: { summary: "كتالوج الكورسات العام" } },
  "/api/v1/courses/{slug}": { get: { summary: "تفاصيل كورس", parameters: [{ in: "path", name: "slug", required: true, schema: { type: "string" } }] } },
  "/api/v1/lessons/{slug}": { get: { summary: "تفاصيل درس" } },
  "/api/v1/lessons/{slug}/quiz": { get: { summary: "أسئلة درس دون الإجابات الصحيحة" } },
  "/api/v1/lessons/{slug}/events": { post: { summary: "حفظ حدث تقدّم موثّق" } },
  "/api/v1/lessons/{slug}/task/grade": { post: { summary: "تصحيح المهمة العملية على الخادم", security: [{ clerkBearer: [] }] } },
  "/api/v1/lessons/{slug}/complete": { post: { summary: "اعتماد إكمال الدرس بعد تحقق الخادم", security: [{ clerkBearer: [] }] } },
  "/api/v1/quiz/answers": { post: { summary: "تصحيح إجابة وإسناد النقاط من الخادم" } },
  "/api/v1/me": { get: { summary: "ملف المتعلّم", security: [{ clerkBearer: [] }] }, patch: { summary: "تحديث ملف المتعلّم", security: [{ clerkBearer: [] }] } },
  "/api/v1/me/overview": { get: { summary: "النقاط والترتيب والاستمرار", security: [{ clerkBearer: [] }] } },
  "/api/v1/leaderboard": { get: { summary: "لوحة المتصدرين" } },
  "/api/v1/config": { get: { summary: "إعدادات التطبيق العامة" } },
  "/api/v1/announcements": { get: { summary: "الإعلانات النشطة" } },
  "/api/v1/devices": { post: { summary: "تسجيل جهاز للإشعارات", security: [{ clerkBearer: [] }] } },
};

export const Route = createFileRoute("/api/v1/openapi.json")({
  server: { handlers: { GET: async () => Response.json({ openapi: "3.1.0", info: { title: "Okaab Learning API", version: "1.0.0", description: "واجهة موحّدة لموقع وتطبيق تعلّم عُقاب" }, servers: [{ url: "https://okaab.org" }], components: { securitySchemes: { clerkBearer: { type: "http", scheme: "bearer", bearerFormat: "JWT" } } }, paths }, { headers: { "cache-control": "public, max-age=3600" } }) } },
});
