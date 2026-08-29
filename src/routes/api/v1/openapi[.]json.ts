import { createFileRoute } from "@tanstack/react-router";

const bearer = [{ clerkBearer: [] }];
const slug = {
  in: "path",
  name: "slug",
  required: true,
  schema: { type: "string", minLength: 1, maxLength: 180 },
};
const jsonBody = (schema: Record<string, unknown>) => ({
  required: true,
  content: { "application/json": { schema } },
});
const responses = (description = "تمت العملية") => ({
  "200": {
    description,
    content: { "application/json": { schema: { $ref: "#/components/schemas/Envelope" } } },
  },
  "400": { $ref: "#/components/responses/BadRequest" },
  "401": { $ref: "#/components/responses/Unauthorized" },
  "429": { $ref: "#/components/responses/RateLimited" },
});

const paths = {
  "/api/v1/catalog": {
    get: { tags: ["المحتوى"], summary: "كتالوج الكورسات العام", responses: responses() },
  },
  "/api/v1/courses/{slug}": {
    get: {
      tags: ["المحتوى"],
      summary: "تفاصيل كورس ودروسه",
      parameters: [slug],
      responses: responses(),
    },
  },
  "/api/v1/lessons/{slug}": {
    get: {
      tags: ["التعلّم"],
      summary: "تفاصيل درس ومحتواه وتقدّم المتعلّم إن كان مسجّلًا",
      parameters: [slug],
      responses: responses(),
    },
  },
  "/api/v1/lessons/{slug}/quiz": {
    get: {
      tags: ["الاختبارات"],
      summary: "أسئلة الدرس دون الإجابات الصحيحة",
      parameters: [slug],
      responses: responses(),
    },
  },
  "/api/v1/lessons/{slug}/events": {
    post: {
      tags: ["التقدّم"],
      summary: "حفظ حدث تقدّم بمعرّف يمنع التكرار",
      security: bearer,
      parameters: [slug],
      requestBody: jsonBody({ $ref: "#/components/schemas/LessonEvent" }),
      responses: responses("تم حفظ الحدث"),
    },
  },
  "/api/v1/lessons/{slug}/task/grade": {
    post: {
      tags: ["المهام"],
      summary: "تصحيح المهمة العملية على الخادم",
      security: bearer,
      parameters: [slug],
      requestBody: jsonBody({ $ref: "#/components/schemas/TaskSubmission" }),
      responses: responses("نتيجة التصحيح"),
    },
  },
  "/api/v1/lessons/{slug}/complete": {
    post: {
      tags: ["التقدّم"],
      summary: "اعتماد إكمال الدرس بعد تحقق الخادم من كل الشروط",
      security: bearer,
      parameters: [slug],
      requestBody: jsonBody({
        type: "object",
        required: ["idempotencyKey"],
        properties: { idempotencyKey: { type: "string", minLength: 12, maxLength: 100 } },
      }),
      responses: responses("تم اعتماد الإكمال"),
    },
  },
  "/api/v1/quiz/answers": {
    post: {
      tags: ["الاختبارات"],
      summary: "تصحيح إجابة وإسناد النقاط من الخادم",
      security: bearer,
      requestBody: jsonBody({ $ref: "#/components/schemas/QuizAnswer" }),
      responses: responses("نتيجة الإجابة دون كشف بقية الإجابات"),
    },
  },
  "/api/v1/me": {
    get: {
      tags: ["الحساب"],
      summary: "ملف المتعلّم",
      security: bearer,
      responses: responses(),
    },
    patch: {
      tags: ["الحساب"],
      summary: "تحديث الاسم أو الميلاد أو خصوصية لوحة المتصدرين",
      security: bearer,
      requestBody: jsonBody({ $ref: "#/components/schemas/ProfileUpdate" }),
      responses: responses("تم تحديث الحساب"),
    },
    delete: {
      tags: ["الحساب"],
      summary: "طلب حذف حساب التعلّم",
      security: bearer,
      requestBody: jsonBody({
        type: "object",
        required: ["confirmation"],
        properties: { confirmation: { type: "string", const: "احذف حسابي" } },
      }),
      responses: responses("تم تعطيل الحساب وبدء مهلة الحذف"),
    },
  },
  "/api/v1/me/overview": {
    get: {
      tags: ["الحساب"],
      summary: "النقاط والترتيب والسلسلة والشارات والاستمرار",
      security: bearer,
      responses: responses(),
    },
  },
  "/api/v1/me/avatar": {
    post: {
      tags: ["الحساب"],
      summary: "مزامنة صورة الحساب الموثقة من Clerk بعد رفعها",
      security: bearer,
      responses: responses("تم تحديث صورة الحساب"),
    },
  },
  "/api/v1/leaderboard": {
    get: {
      tags: ["المنصة"],
      summary: "أول 20 متعلّمًا وترتيب الحساب الحالي",
      parameters: [
        {
          in: "query",
          name: "period",
          schema: { type: "string", enum: ["weekly", "monthly", "all"], default: "weekly" },
        },
      ],
      responses: responses(),
    },
  },
  "/api/v1/config": {
    get: { tags: ["المنصة"], summary: "إعدادات التطبيق العامة", responses: responses() },
  },
  "/api/v1/announcements": {
    get: { tags: ["المنصة"], summary: "الإعلانات النشطة", responses: responses() },
  },
  "/api/v1/devices": {
    post: {
      tags: ["المنصة"],
      summary: "تسجيل رمز جهاز للإشعارات",
      security: bearer,
      requestBody: jsonBody({ $ref: "#/components/schemas/Device" }),
      responses: responses("تم تسجيل الجهاز"),
    },
    delete: {
      tags: ["المنصة"],
      summary: "إلغاء تسجيل جهاز من الإشعارات",
      security: bearer,
      requestBody: jsonBody({
        type: "object",
        required: ["token"],
        properties: { token: { type: "string", minLength: 20, maxLength: 500 } },
      }),
      responses: responses("تم إيقاف إشعارات الجهاز"),
    },
  },
  "/api/v1/admin/push": {
    post: {
      tags: ["الإدارة"],
      summary: "إرسال Push للفئة المختارة بحد أقصى 3 مرات خلال 7 أيام",
      security: bearer,
      requestBody: jsonBody({
        type: "object",
        required: ["title", "body", "audience"],
        properties: {
          title: { type: "string", minLength: 3, maxLength: 100 },
          body: { type: "string", minLength: 3, maxLength: 500 },
          audience: { type: "string", enum: ["all", "active", "inactive_7d"] },
        },
      }),
      responses: responses("نتيجة إرسال الإشعار"),
    },
  },
  "/api/v1/admin/learners": {
    get: {
      tags: ["الإدارة"],
      summary: "بحث المتعلّمين ومؤشراتهم",
      security: bearer,
      parameters: [{ in: "query", name: "q", schema: { type: "string", maxLength: 100 } }],
      responses: responses(),
    },
    patch: {
      tags: ["الإدارة"],
      summary: "تعديل حالة أو ظهور أو نقاط متعلّم",
      security: bearer,
      requestBody: jsonBody({ type: "object", required: ["action", "userId"] }),
      responses: responses("تم التعديل وسُجّل في سجل التدقيق"),
    },
  },
  "/api/v1/admin/questions": {
    get: {
      tags: ["الإدارة"],
      summary: "بنك الأسئلة وإعداد المهام العملية",
      security: bearer,
      responses: responses(),
    },
    post: {
      tags: ["الإدارة"],
      summary: "إنشاء أو تعديل سؤال واختياراته",
      security: bearer,
      requestBody: jsonBody({ type: "object", required: ["lessonId", "text", "level", "options"] }),
      responses: responses("تم حفظ السؤال"),
    },
    patch: {
      tags: ["الإدارة"],
      summary: "تفعيل وتكوين المهمة العملية لدرس",
      security: bearer,
      requestBody: jsonBody({
        type: "object",
        required: ["lessonId", "enabled", "prompt", "requiredSlideIndex"],
      }),
      responses: responses("تم حفظ المهمة"),
    },
    delete: {
      tags: ["الإدارة"],
      summary: "حذف سؤال أو أرشفته إذا كانت له محاولات",
      security: bearer,
      parameters: [{ in: "query", name: "id", required: true, schema: { type: "string" } }],
      responses: responses("تم الحذف أو الأرشفة"),
    },
  },
  "/api/v1/admin/platform": {
    get: {
      tags: ["الإدارة"],
      summary: "الإعدادات والإعلانات والتحليلات",
      security: bearer,
      responses: responses(),
    },
    patch: {
      tags: ["الإدارة"],
      summary: "تحديث Remote Config",
      security: bearer,
      responses: responses(),
    },
    post: {
      tags: ["الإدارة"],
      summary: "إنشاء إعلان",
      security: bearer,
      responses: responses(),
    },
    delete: {
      tags: ["الإدارة"],
      summary: "حذف إعلان",
      security: bearer,
      parameters: [{ in: "query", name: "id", required: true, schema: { type: "string" } }],
      responses: responses(),
    },
  },
};

const document = {
  openapi: "3.1.0",
  info: {
    title: "Okaab Learning API",
    version: "1.2.0",
    description:
      "واجهة عُقاب الموحّدة للموقع وتطبيق Android. المصادقة الخاصة تستخدم Clerk Bearer JWT، والنقاط والتصحيح يُعتمدان على الخادم فقط.",
  },
  servers: [{ url: "https://okaab.org", description: "الإنتاج" }],
  tags: [
    { name: "المحتوى" },
    { name: "التعلّم" },
    { name: "التقدّم" },
    { name: "الاختبارات" },
    { name: "المهام" },
    { name: "الحساب" },
    { name: "المنصة" },
    { name: "الإدارة" },
  ],
  components: {
    securitySchemes: {
      clerkBearer: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    responses: {
      BadRequest: { description: "بيانات غير صحيحة" },
      Unauthorized: { description: "يلزم تسجيل الدخول أو لا توجد صلاحية" },
      RateLimited: { description: "تم تجاوز حد الاستخدام المؤقت" },
    },
    schemas: {
      Error: {
        type: "object",
        required: ["message"],
        properties: { message: { type: "string" } },
      },
      Envelope: {
        type: "object",
        required: ["data", "error"],
        properties: {
          data: { nullable: true },
          error: { anyOf: [{ $ref: "#/components/schemas/Error" }, { type: "null" }] },
        },
      },
      LessonEvent: {
        type: "object",
        required: ["type", "idempotencyKey"],
        properties: {
          type: {
            type: "string",
            enum: [
              "slide_changed",
              "video_progress",
              "quiz_finished",
              "task_result",
              "lesson_finished",
            ],
          },
          idempotencyKey: { type: "string", minLength: 12, maxLength: 100 },
          index: { type: "integer", minimum: 0, maximum: 10000 },
          percent: { type: "number", minimum: 0, maximum: 100 },
          score: { type: "number", minimum: 0, maximum: 100 },
          passed: { type: "boolean" },
        },
      },
      QuizAnswer: {
        type: "object",
        required: ["questionId", "optionId", "idempotencyKey"],
        properties: {
          questionId: { type: "string", maxLength: 64 },
          optionId: { type: "string", maxLength: 64 },
          idempotencyKey: { type: "string", minLength: 12, maxLength: 100 },
        },
      },
      TaskSubmission: {
        type: "object",
        required: ["submission", "idempotencyKey"],
        properties: {
          submission: { type: "string", minLength: 10, maxLength: 20000 },
          idempotencyKey: { type: "string", minLength: 12, maxLength: 100 },
        },
      },
      ProfileUpdate: {
        type: "object",
        properties: {
          displayName: { type: "string", minLength: 2, maxLength: 40 },
          birthdate: { anyOf: [{ type: "string", format: "date" }, { type: "null" }] },
          leaderboardVisible: { type: "boolean" },
        },
      },
      Device: {
        type: "object",
        required: ["token", "platform", "appVersion"],
        properties: {
          token: { type: "string", minLength: 20, maxLength: 500 },
          platform: { type: "string", enum: ["android", "ios"] },
          appVersion: { type: "string", minLength: 1, maxLength: 40 },
        },
      },
    },
  },
  paths,
};

export const Route = createFileRoute("/api/v1/openapi.json")({
  server: {
    handlers: {
      GET: async () =>
        Response.json(document, {
          headers: {
            "cache-control": "public, max-age=3600",
            "content-type": "application/json; charset=utf-8",
          },
        }),
    },
  },
});
