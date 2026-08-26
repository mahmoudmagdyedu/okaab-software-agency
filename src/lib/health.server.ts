import { dbHealth, getDb, sql } from "@/lib/db.server";
import type { HealthStatus } from "@/integrations/supabase/types";

type CheckResult = {
  key: string;
  status: HealthStatus;
  latencyMs: number | null;
  statusCode: number | null;
  summary: string;
  impact: string;
  cause: string;
  action: string;
  details?: Record<string, unknown>;
};

async function httpCheck(key: string, url: string, label: string): Promise<CheckResult> {
  const started = performance.now();
  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(12_000),
      headers: { "user-agent": "Okaab-Health/2.0" },
    });
    const latencyMs = Math.round(performance.now() - started);
    const status: HealthStatus = response.ok
      ? latencyMs > 2500
        ? "degraded"
        : "healthy"
      : response.status >= 500
        ? "down"
        : "degraded";
    return {
      key,
      status,
      latencyMs,
      statusCode: response.status,
      summary: response.ok
        ? `${label} يعمل${status === "degraded" ? " لكنه أبطأ من المعتاد" : " بشكل طبيعي"}.`
        : `${label} أعاد خطأ HTTP ${response.status}.`,
      impact: response.ok
        ? "لا يوجد تأثير ملحوظ على الزوار."
        : `قد لا يستطيع الزائر استخدام ${label}.`,
      cause: response.ok
        ? "الخدمة تستجيب من خادم Heroku."
        : "قد يكون هناك نشر غير مكتمل أو ضغط على الخادم أو عطل خارجي.",
      action: response.ok
        ? "لا يلزم أي إجراء الآن."
        : "افتح Heroku Logs وتحقق من آخر عملية نشر ثم أعد الاختبار.",
      details: { finalUrl: response.url },
    };
  } catch (error) {
    return {
      key,
      status: "down",
      latencyMs: Math.round(performance.now() - started),
      statusCode: null,
      summary: `${label} لا يستجيب.`,
      impact: `الزوار لا يستطيعون الوصول إلى ${label}.`,
      cause: "الخادم متوقف أو الاتصال انتهت مهلته.",
      action: "تحقق من Heroku والدومين ثم أعد تشغيل التطبيق عند الحاجة.",
      details: { error: error instanceof Error ? error.name : "network_error" },
    };
  }
}

async function tlsCheck(): Promise<CheckResult> {
  const started = performance.now();
  try {
    const tls = await import("node:tls");
    const certificate = await new Promise<{ valid_to?: string }>((resolve, reject) => {
      const socket = tls.connect(
        { host: "okaab.org", port: 443, servername: "okaab.org", rejectUnauthorized: true },
        () => {
          resolve(socket.getPeerCertificate());
          socket.end();
        },
      );
      socket.setTimeout(8_000, () => {
        socket.destroy();
        reject(new Error("timeout"));
      });
      socket.once("error", reject);
    });
    const expiresAt = certificate.valid_to ? new Date(certificate.valid_to) : null;
    const days = expiresAt ? Math.floor((expiresAt.getTime() - Date.now()) / 86_400_000) : null;
    const status: HealthStatus =
      days === null ? "unknown" : days < 7 ? "down" : days < 21 ? "degraded" : "healthy";
    return {
      key: "tls",
      status,
      latencyMs: Math.round(performance.now() - started),
      statusCode: null,
      summary:
        days === null ? "تعذّر قراءة تاريخ شهادة HTTPS." : `شهادة HTTPS صالحة لمدة ${days} يومًا.`,
      impact:
        status === "healthy"
          ? "الاتصال آمن ولا يوجد تأثير."
          : "قد يظهر تحذير أمان للزوار إذا انتهت الشهادة.",
      cause:
        status === "healthy"
          ? "Heroku يدير الشهادة بصورة صحيحة."
          : "تجديد الشهادة أو DNS يحتاج مراجعة.",
      action:
        status === "healthy"
          ? "لا يلزم إجراء."
          : "راجع Automatic Certificate Management وإعدادات DNS.",
      details: { expiresAt: expiresAt?.toISOString() ?? null, daysRemaining: days },
    };
  } catch (error) {
    return {
      key: "tls",
      status: "down",
      latencyMs: Math.round(performance.now() - started),
      statusCode: null,
      summary: "فشل التحقق من شهادة HTTPS.",
      impact: "قد يتأثر الاتصال الآمن بالموقع.",
      cause: "خطأ DNS أو TLS أو انتهاء مهلة الاتصال.",
      action: "افحص شهادة okaab.org وإعدادات الدومين في Heroku.",
      details: { error: error instanceof Error ? error.name : "tls_error" },
    };
  }
}

async function serviceCheck(
  key: string,
  url: string,
  token: string | undefined,
  healthyText: string,
  failedText: string,
): Promise<CheckResult> {
  const started = performance.now();
  let ok = false;
  let code: number | null = null;
  try {
    if (token) {
      const response = await fetch(url, {
        headers: { authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(8_000),
      });
      ok = response.ok;
      code = response.status;
    }
  } catch {
    ok = false;
  }
  return {
    key,
    status: ok ? "healthy" : "degraded",
    latencyMs: Math.round(performance.now() - started),
    statusCode: code,
    summary: ok ? healthyText : failedText,
    impact: ok ? "لا يوجد تأثير." : "قد تتعطل الوظيفة المرتبطة بهذه الخدمة.",
    cause: ok
      ? "المفتاح والاتصال يعملان."
      : "المفتاح غير موجود أو غير صالح أو الخدمة الخارجية لا تستجيب.",
    action: ok ? "لا يلزم إجراء." : `راجع مفتاح ${key} داخل Heroku Config Vars.`,
  };
}

async function resendCheck(): Promise<CheckResult> {
  const started = performance.now();
  const token = process.env["RESEND_API_KEY"];
  let code: number | null = null;
  let authenticated = false;

  try {
    if (token) {
      // A sending-only Resend key cannot read /domains. Submit an intentionally
      // incomplete email instead: an authenticated key returns 422 without
      // sending anything, while an invalid/revoked key returns 401/403.
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        body: "{}",
        signal: AbortSignal.timeout(8_000),
      });
      code = response.status;
      authenticated = response.status === 422;
    }
  } catch {
    authenticated = false;
  }

  return {
    key: "email",
    status: authenticated ? "healthy" : "degraded",
    latencyMs: Math.round(performance.now() - started),
    statusCode: code,
    summary: authenticated
      ? "خدمة Resend جاهزة للإرسال."
      : "تعذّر تأكيد جاهزية Resend.",
    impact: authenticated
      ? "لا يوجد تأثير."
      : "قد لا تصل تنبيهات حالة النظام والرسائل البريدية.",
    cause: authenticated
      ? "مفتاح الإرسال مقبول والاتصال يعمل."
      : "مفتاح الإرسال غير موجود أو غير صالح أو خدمة Resend لا تستجيب.",
    action: authenticated
      ? "لا يلزم إجراء."
      : "راجع RESEND_API_KEY داخل Heroku Config Vars.",
  };
}

async function sendEmail(subject: string, html: string, recipients: string[]) {
  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey || !recipients.length) return;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
    body: JSON.stringify({
      from: "Okaab Health <noreply@okaab.org>",
      to: recipients,
      subject,
      html,
    }),
    signal: AbortSignal.timeout(12_000),
  });
}

async function persist(checks: CheckResult[]) {
  const pool = await getDb();
  const services = await pool
    .request()
    .query<{ id: string; key: string; name_ar: string }>(
      "select id,[key],name_ar from okaab.health_services where is_enabled=1",
    );
  const serviceMap = new Map(services.recordset.map((item) => [item.key, item]));
  const admins = await pool
    .request()
    .query<{ email: string }>(
      "select email from okaab.profiles where role in ('super_admin','admin') and is_active=1",
    );
  const recipients = admins.recordset.map((item) => item.email);
  for (const check of checks) {
    const service = serviceMap.get(check.key);
    if (!service) continue;
    await pool
      .request()
      .input("service_id", sql.NVarChar(64), service.id)
      .input("status", sql.NVarChar(20), check.status)
      .input("latency", sql.Int, check.latencyMs)
      .input("code", sql.Int, check.statusCode)
      .input("summary", sql.NVarChar(1000), check.summary)
      .input("impact", sql.NVarChar(1000), check.impact)
      .input("cause", sql.NVarChar(1000), check.cause)
      .input("action", sql.NVarChar(1000), check.action)
      .input("details", sql.NVarChar(sql.MAX), JSON.stringify(check.details || {}))
      .input(
        "version",
        sql.NVarChar(120),
        process.env["HEROKU_SLUG_COMMIT"] || process.env["SOURCE_VERSION"] || null,
      )
      .query(
        "insert into okaab.health_checks (service_id,status,latency_ms,status_code,summary_ar,impact_ar,likely_cause_ar,action_ar,safe_details,deployment_version) values (@service_id,@status,@latency,@code,@summary,@impact,@cause,@action,@details,@version)",
      );
    const openResult = await pool
      .request()
      .input("service_id", sql.NVarChar(64), service.id)
      .query<{ id: string; status: HealthStatus }>(
        "select top (1) id,status from okaab.health_incidents where service_id=@service_id and resolved_at is null order by started_at desc",
      );
    const open = openResult.recordset[0];
    if (!["healthy", "unknown"].includes(check.status) && !open) {
      await pool
        .request()
        .input("service_id", sql.NVarChar(64), service.id)
        .input("status", sql.NVarChar(20), check.status)
        .input("title", sql.NVarChar(300), `مشكلة في ${service.name_ar}`)
        .input("summary", sql.NVarChar(1000), check.summary)
        .input("impact", sql.NVarChar(1000), check.impact)
        .input("cause", sql.NVarChar(1000), check.cause)
        .input("action", sql.NVarChar(1000), check.action)
        .query(
          "insert into okaab.health_incidents (service_id,status,title_ar,summary_ar,impact_ar,likely_cause_ar,action_ar,last_alerted_at) values (@service_id,@status,@title,@summary,@impact,@cause,@action,sysutcdatetime())",
        );
      await sendEmail(
        `تنبيه عُقاب: ${service.name_ar}`,
        `<div dir="rtl"><h2>${check.summary}</h2><p><b>التأثير:</b> ${check.impact}</p><p><b>الخطوة:</b> ${check.action}</p></div>`,
        recipients,
      );
    } else if (check.status === "healthy" && open) {
      await pool
        .request()
        .input("id", sql.NVarChar(64), open.id)
        .query(
          "update okaab.health_incidents set status='healthy',resolved_at=sysutcdatetime(),updated_at=sysutcdatetime() where id=@id",
        );
      await sendEmail(
        `تم حل مشكلة ${service.name_ar}`,
        `<div dir="rtl"><h2>عادت الخدمة للعمل</h2><p>${check.summary}</p></div>`,
        recipients,
      );
    } else if (open && open.status !== check.status) {
      await pool
        .request()
        .input("id", sql.NVarChar(64), open.id)
        .input("status", sql.NVarChar(20), check.status)
        .input("summary", sql.NVarChar(1000), check.summary)
        .input("impact", sql.NVarChar(1000), check.impact)
        .input("cause", sql.NVarChar(1000), check.cause)
        .input("action", sql.NVarChar(1000), check.action)
        .query(
          "update okaab.health_incidents set status=@status,summary_ar=@summary,impact_ar=@impact,likely_cause_ar=@cause,action_ar=@action,updated_at=sysutcdatetime() where id=@id",
        );
    }
  }
}

export async function runDeepHealthCheck() {
  const base = process.env["PUBLIC_SITE_URL"] || "https://okaab.org";
  const checks = await Promise.all([
    httpCheck("website", `${base}/`, "الموقع الرئيسي"),
    httpCheck("courses", `${base}/courses`, "منصة الكورسات"),
    httpCheck("admin", `${base}/admin/login`, "صفحة دخول الإدارة"),
    httpCheck(
      "youtube",
      `https://www.youtube.com/feeds/videos.xml?channel_id=UCBAEq8qb5_yvj6_Ef96agOg`,
      "اتصال YouTube",
    ),
    tlsCheck(),
    serviceCheck(
      "authentication",
      "https://api.clerk.com/v1/users?limit=1",
      process.env["CLERK_SECRET_KEY"],
      "خدمة Clerk تستجيب وتسجيل الدخول جاهز.",
      "تعذّر تأكيد جاهزية Clerk.",
    ),
    resendCheck(),
  ]);

  const dbStarted = performance.now();
  try {
    await dbHealth();
    checks.push({
      key: "database",
      status: "healthy",
      latencyMs: Math.round(performance.now() - dbStarted),
      statusCode: null,
      summary: "قاعدة بيانات Heroku تعمل بصورة طبيعية.",
      impact: "لا يوجد تأثير.",
      cause: "الاتصال والقراءة ناجحان.",
      action: "لا يلزم إجراء.",
    });
  } catch {
    checks.push({
      key: "database",
      status: "down",
      latencyMs: Math.round(performance.now() - dbStarted),
      statusCode: null,
      summary: "قاعدة بيانات Heroku لا تستجيب.",
      impact: "المهام والكورسات قد لا تعمل.",
      cause: "اتصال MSSQL أو الإضافة يحتاج مراجعة.",
      action: "راجع MSSQL add-on وHeroku Logs.",
    });
  }

  const pool = await getDb();
  const storageStarted = performance.now();
  try {
    await pool.request().query("select top (1) deck_id from okaab.slide_assets");
    checks.push({
      key: "storage",
      status: "healthy",
      latencyMs: Math.round(performance.now() - storageStarted),
      statusCode: null,
      summary: "تخزين Slides داخل قاعدة Heroku جاهز.",
      impact: "لا يوجد تأثير.",
      cause: "جدول الملفات متاح.",
      action: "لا يلزم إجراء.",
    });
  } catch {
    checks.push({
      key: "storage",
      status: "down",
      latencyMs: Math.round(performance.now() - storageStarted),
      statusCode: null,
      summary: "تعذّر الوصول إلى ملفات Slides.",
      impact: "رفع أو عرض Slides قد يفشل.",
      cause: "جدول التخزين أو الاتصال غير متاح.",
      action: "شغّل migrations وراجع MSSQL.",
    });
  }

  const state = await pool
    .request()
    .query<{ last_success_at: Date | null; consecutive_failures: number }>(
      "select top (1) last_success_at,consecutive_failures from okaab.youtube_sync_state",
    );
  const lastSync = state.recordset[0]?.last_success_at
    ? new Date(state.recordset[0].last_success_at).getTime()
    : null;
  const age = lastSync === null ? null : Math.round((Date.now() - lastSync) / 60_000);
  const youtube = checks.find((item) => item.key === "youtube");
  if (youtube && youtube.status !== "down") {
    youtube.status = age === null || age > 390 ? "degraded" : "healthy";
    youtube.summary =
      age === null
        ? "القناة متاحة لكن أول مزامنة لم تُنفذ بعد."
        : `القناة متاحة؛ آخر مزامنة ناجحة منذ ${age} دقيقة.`;
    youtube.action =
      youtube.status === "healthy"
        ? "لا يلزم إجراء."
        : "شغّل المزامنة من صفحة الكورسات ثم راجع YOUTUBE_API_KEY.";
  }

  const memoryUsedMb = Math.round(process.memoryUsage().rss / 1024 / 1024);
  const memoryLimitMb = Number(process.env["WEB_MEMORY_MB"] || "512");
  const ratio = memoryUsedMb / memoryLimitMb;
  checks.push({
    key: "runtime",
    status: ratio >= 0.9 ? "down" : ratio >= 0.75 ? "degraded" : "healthy",
    latencyMs: null,
    statusCode: null,
    summary: `الخادم يستخدم ${memoryUsedMb} من نحو ${memoryLimitMb}MB.`,
    impact: ratio >= 0.75 ? "قد يبطؤ الخادم إذا استمر الاستهلاك." : "لا يوجد تأثير.",
    cause: ratio >= 0.75 ? "ضغط طلبات أو عملية تستهلك ذاكرة." : "الاستهلاك طبيعي.",
    action: ratio >= 0.75 ? "راجع Heroku Metrics وLogs." : "لا يلزم إجراء.",
    details: { memoryUsedMb, memoryLimitMb, node: process.version },
  });
  const previousCheck = await pool
    .request()
    .query<{ checked_at: Date | null }>(
      "select max(checked_at) as checked_at from okaab.health_checks",
    );
  const previousAt = previousCheck.recordset[0]?.checked_at
    ? new Date(previousCheck.recordset[0].checked_at).getTime()
    : null;
  const monitorAge = previousAt === null ? null : Math.round((Date.now() - previousAt) / 60_000);
  const schedulerStatus: HealthStatus =
    monitorAge === null ? "unknown" : monitorAge > 15 ? "degraded" : "healthy";
  checks.push({
    key: "scheduler",
    status: schedulerStatus,
    latencyMs: null,
    statusCode: null,
    summary:
      monitorAge === null
        ? "هذه أول دورة فحص؛ سيُقاس الانتظام في الدورة التالية."
        : schedulerStatus === "healthy"
          ? `الفحص الخارجي منتظم؛ آخر دورة منذ ${monitorAge} دقيقة.`
          : `الفحص الخارجي متأخر؛ آخر دورة منذ ${monitorAge} دقيقة.`,
    impact: schedulerStatus === "degraded" ? "قد تتأخر تنبيهات الأعطال." : "لا يوجد تأثير.",
    cause:
      schedulerStatus === "degraded"
        ? "GitHub Actions أو السر الموقّع يحتاج مراجعة."
        : "مهمة المراقبة الخارجية تعمل حسب الجدول.",
    action:
      schedulerStatus === "degraded"
        ? "راجع workflow Okaab external monitor في GitHub Actions."
        : "لا يلزم إجراء.",
    details: { monitorAgeMinutes: monitorAge },
  });
  await persist(checks);
  return {
    status: checks.some((item) => item.status === "down")
      ? "down"
      : checks.some((item) => item.status === "degraded")
        ? "degraded"
        : "healthy",
    checkedAt: new Date().toISOString(),
    checks,
  };
}
