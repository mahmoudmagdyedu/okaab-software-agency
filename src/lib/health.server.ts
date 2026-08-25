import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, HealthStatus } from "@/integrations/supabase/types";

type CheckResult = {
  key: string;
  status: HealthStatus;
  latencyMs: number | null;
  statusCode: number | null;
  summary: string;
  impact: string;
  cause: string;
  action: string;
  details?: Record<string, string | number | boolean | null>;
};

async function httpCheck(key: string, url: string, label: string): Promise<CheckResult> {
  const started = performance.now();
  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(12_000),
      headers: { "user-agent": "Okaab-Health/1.0" },
    });
    const latencyMs = Math.round(performance.now() - started);
    const healthy = response.ok;
    return {
      key,
      status: healthy
        ? latencyMs > 2500
          ? "degraded"
          : "healthy"
        : response.status >= 500
          ? "down"
          : "degraded",
      latencyMs,
      statusCode: response.status,
      summary: healthy
        ? `${label} يعمل${latencyMs > 2500 ? " لكنه أبطأ من المعتاد" : " بشكل طبيعي"}.`
        : `${label} أعاد خطأ HTTP ${response.status}.`,
      impact: healthy ? "لا يوجد تأثير ملحوظ على الزوار." : `قد لا يستطيع الزائر استخدام ${label}.`,
      cause: healthy
        ? "الخدمة تستجيب من الخادم الحالي."
        : "قد يكون هناك نشر غير مكتمل، ضغط على الخادم، أو عطل لدى مزود خارجي.",
      action: healthy
        ? "لا يلزم أي إجراء الآن."
        : "افتح سجلات Heroku وتحقق من آخر عملية نشر ثم أعد الاختبار.",
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
      action: "تحقق من حالة Heroku والدومين ثم أعد تشغيل التطبيق إذا لزم.",
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
          : "تجديد الشهادة تأخر أو إعداد الدومين يحتاج مراجعة.",
      action:
        status === "healthy"
          ? "لا يلزم إجراء."
          : "راجع Automatic Certificate Management في Heroku وإعدادات DNS.",
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

async function sendIncidentEmail(subject: string, html: string, recipients: string[]) {
  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey || !recipients.length) return;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
    body: JSON.stringify({
      from: "Okaab Health <noreply@okaab.org>",
      to: recipients,
      subject,
      html,
    }),
    signal: AbortSignal.timeout(12_000),
  });
}

async function persist(admin: SupabaseClient<Database>, checks: CheckResult[]) {
  const servicesResult = await admin.from("health_services").select("*");
  if (servicesResult.error) throw servicesResult.error;
  const services = new Map((servicesResult.data ?? []).map((service) => [service.key, service]));
  const adminsResult = await admin
    .from("profiles")
    .select("id,email")
    .in("role", ["super_admin", "admin"])
    .eq("is_active", true);
  const admins = adminsResult.data ?? [];

  for (const check of checks) {
    const service = services.get(check.key);
    if (!service) continue;
    await admin.from("health_checks").insert({
      service_id: service.id,
      status: check.status,
      latency_ms: check.latencyMs,
      status_code: check.statusCode,
      summary_ar: check.summary,
      impact_ar: check.impact,
      likely_cause_ar: check.cause,
      action_ar: check.action,
      safe_details: check.details ?? {},
      deployment_version:
        process.env["HEROKU_SLUG_COMMIT"] ?? process.env["SOURCE_VERSION"] ?? null,
    });
    const openResult = await admin
      .from("health_incidents")
      .select("*")
      .eq("service_id", service.id)
      .is("resolved_at", null)
      .maybeSingle();
    const open = openResult.data;
    if (check.status !== "healthy" && check.status !== "unknown" && !open) {
      const incident = await admin
        .from("health_incidents")
        .insert({
          service_id: service.id,
          status: check.status,
          title_ar: `مشكلة في ${service.name_ar}`,
          summary_ar: check.summary,
          impact_ar: check.impact,
          likely_cause_ar: check.cause,
          action_ar: check.action,
          last_alerted_at: new Date().toISOString(),
        })
        .select("id")
        .single();
      if (incident.data)
        await admin.from("admin_notifications").insert(
          admins.map((person) => ({
            recipient_id: person.id,
            incident_id: incident.data.id,
            title_ar: `تنبيه: ${service.name_ar}`,
            body_ar: `${check.summary} ${check.action}`,
          })),
        );
      await sendIncidentEmail(
        `تنبيه عُقاب: ${service.name_ar}`,
        `<div dir="rtl" style="font-family:Arial"><h2>${check.summary}</h2><p><b>التأثير:</b> ${check.impact}</p><p><b>السبب المتوقع:</b> ${check.cause}</p><p><b>الخطوة التالية:</b> ${check.action}</p></div>`,
        admins.map((person) => person.email),
      );
    } else if (check.status === "healthy" && open) {
      await admin
        .from("health_incidents")
        .update({ resolved_at: new Date().toISOString(), status: "healthy" })
        .eq("id", open.id);
      await sendIncidentEmail(
        `تم حل مشكلة ${service.name_ar}`,
        `<div dir="rtl" style="font-family:Arial"><h2>عادت الخدمة للعمل</h2><p>${check.summary}</p></div>`,
        admins.map((person) => person.email),
      );
    } else if (open && open.status !== check.status) {
      await admin
        .from("health_incidents")
        .update({
          status: check.status,
          summary_ar: check.summary,
          impact_ar: check.impact,
          likely_cause_ar: check.cause,
          action_ar: check.action,
        })
        .eq("id", open.id);
    }
  }
}

export async function runDeepHealthCheck(admin: SupabaseClient<Database>) {
  const base = process.env["PUBLIC_SITE_URL"] ?? "https://okaab.org";
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
  ]);

  const databaseStarted = performance.now();
  const database = await admin.from("youtube_sync_state").select("channel_id").limit(1);
  checks.push({
    key: "database",
    status: database.error ? "down" : "healthy",
    latencyMs: Math.round(performance.now() - databaseStarted),
    statusCode: null,
    summary: database.error
      ? "قاعدة البيانات لا تستجيب للفحص."
      : "قاعدة البيانات تعمل بصورة طبيعية.",
    impact: database.error ? "تسجيل الدخول والمهام والكورسات قد لا تعمل." : "لا يوجد تأثير.",
    cause: database.error
      ? "اتصال Supabase أو صلاحية المفتاح تحتاج مراجعة."
      : "الاتصال والقراءة ناجحان.",
    action: database.error
      ? "راجع حالة Supabase والمفتاح السري وسجلات Database."
      : "لا يلزم إجراء.",
    details: { errorCode: database.error?.code ?? null },
  });

  const storageStarted = performance.now();
  const storage = await admin.storage
    .from("course-slides")
    .upload(".health/probe.txt", new Blob(["okaab-storage-health"]), {
      contentType: "text/plain",
      upsert: true,
    });
  const storageRead = storage.error
    ? null
    : await admin.storage.from("course-slides").download(".health/probe.txt");
  const storageError = storage.error ?? storageRead?.error ?? null;
  checks.push({
    key: "storage",
    status: storageError ? "down" : "healthy",
    latencyMs: Math.round(performance.now() - storageStarted),
    statusCode: null,
    summary: storageError
      ? "تعذّرت كتابة أو قراءة ملف الفحص في تخزين Slides."
      : "تمت كتابة وقراءة ملف فحص صغير في تخزين Slides.",
    impact: storageError ? "رفع أو عرض الـSlides قد يفشل." : "لا يوجد تأثير.",
    cause: storageError
      ? "Bucket غير موجود أو صلاحية Storage غير صحيحة."
      : "الرفع والقراءة يعملان بصورة طبيعية.",
    action: storageError ? "راجع bucket course-slides وسياسات Storage." : "لا يلزم إجراء.",
    details: { probe: storageError ? "failed" : "write_and_read_ok" },
  });

  const authStarted = performance.now();
  const authUrl = `${process.env["SUPABASE_URL"]}/auth/v1/health`;
  let authOk = false;
  try {
    authOk = (
      await fetch(authUrl, {
        headers: { apikey: process.env["SUPABASE_PUBLISHABLE_KEY"] ?? "" },
        signal: AbortSignal.timeout(8_000),
      })
    ).ok;
  } catch {
    authOk = false;
  }
  checks.push({
    key: "auth",
    status: authOk ? "healthy" : "down",
    latencyMs: Math.round(performance.now() - authStarted),
    statusCode: null,
    summary: authOk ? "خدمة تسجيل الدخول تستجيب." : "خدمة تسجيل الدخول لا تستجيب.",
    impact: authOk ? "لا يوجد تأثير." : "لن تصل روابط الدخول أو تبدأ الجلسات.",
    cause: authOk ? "Supabase Auth متاح." : "عطل في Auth أو إعدادات رابط Supabase.",
    action: authOk ? "لا يلزم إجراء." : "راجع Auth Logs وحالة مشروع Supabase.",
  });

  const resendStarted = performance.now();
  let resendStatus = false;
  if (process.env["RESEND_API_KEY"]) {
    try {
      resendStatus = (
        await fetch("https://api.resend.com/domains", {
          headers: { Authorization: `Bearer ${process.env["RESEND_API_KEY"]}` },
          signal: AbortSignal.timeout(8_000),
        })
      ).ok;
    } catch {
      resendStatus = false;
    }
  }
  checks.push({
    key: "email",
    status: resendStatus ? "healthy" : "degraded",
    latencyMs: Math.round(performance.now() - resendStarted),
    statusCode: null,
    summary: resendStatus ? "خدمة البريد جاهزة للإرسال." : "تعذّر تأكيد جاهزية خدمة البريد.",
    impact: resendStatus ? "لا يوجد تأثير." : "قد تتأخر روابط الدخول وتنبيهات الأعطال.",
    cause: resendStatus
      ? "Resend يقبل المفتاح الحالي."
      : "مفتاح Resend أو الدومين أو الاتصال يحتاج مراجعة.",
    action: resendStatus ? "لا يلزم إجراء." : "راجع RESEND_API_KEY وحالة okaab.org داخل Resend.",
  });

  const syncResult = await admin
    .from("youtube_sync_state")
    .select("last_success_at,last_webhook_at,consecutive_failures")
    .eq("channel_id", "UCBAEq8qb5_yvj6_Ef96agOg")
    .maybeSingle();
  const lastSync = syncResult.data?.last_success_at
    ? new Date(syncResult.data.last_success_at).getTime()
    : null;
  const syncAgeMinutes = lastSync === null ? null : Math.round((Date.now() - lastSync) / 60_000);
  const youtubeCheck = checks.find((check) => check.key === "youtube");
  if (youtubeCheck && youtubeCheck.status !== "down") {
    const stale = syncAgeMinutes === null || syncAgeMinutes > 390;
    youtubeCheck.status = stale ? "degraded" : "healthy";
    youtubeCheck.summary = stale
      ? "قناة YouTube متاحة لكن المزامنة التصحيحية متأخرة أو لم تبدأ بعد."
      : `مزامنة YouTube سليمة؛ آخر نجاح منذ ${syncAgeMinutes} دقيقة.`;
    youtubeCheck.impact = stale
      ? "قد تتأخر الفيديوهات الجديدة في الظهور على الموقع."
      : "الفيديوهات الجديدة تصل بصورة طبيعية.";
    youtubeCheck.cause = stale
      ? "مفتاح YouTube أو مهمة المزامنة كل 6 ساعات تحتاج مراجعة."
      : "الاتصال بالقناة وسجل المزامنة يعملان.";
    youtubeCheck.action = stale
      ? "افتح إدارة الكورسات وشغّل مزامنة الآن ثم راجع YouTube API وCron."
      : "لا يلزم إجراء.";
    youtubeCheck.details = {
      ...youtubeCheck.details,
      lastSuccessAt: syncResult.data?.last_success_at ?? null,
      lastWebhookAt: syncResult.data?.last_webhook_at ?? null,
      consecutiveFailures: syncResult.data?.consecutive_failures ?? 0,
    };
  }

  const memory = process.memoryUsage();
  const memoryLimitMb = Number(process.env["WEB_MEMORY_MB"] ?? "512");
  const memoryUsedMb = Math.round(memory.rss / 1024 / 1024);
  const memoryRatio = memoryUsedMb / memoryLimitMb;
  const runtimeStatus: HealthStatus =
    memoryRatio >= 0.9 ? "down" : memoryRatio >= 0.75 ? "degraded" : "healthy";
  checks.push({
    key: "runtime",
    status: runtimeStatus,
    latencyMs: null,
    statusCode: null,
    summary: `الخادم يعمل ويستخدم ${memoryUsedMb} من نحو ${memoryLimitMb} ميجابايت من الذاكرة.`,
    impact:
      runtimeStatus === "healthy"
        ? "لا يوجد تأثير."
        : "قد يبطؤ الخادم أو تعيد Heroku تشغيله إذا استمر استهلاك الذاكرة.",
    cause:
      runtimeStatus === "healthy"
        ? "استهلاك الذاكرة داخل النطاق الطبيعي."
        : "ضغط طلبات أو عملية تستهلك ذاكرة أكثر من المتوقع.",
    action:
      runtimeStatus === "healthy"
        ? "لا يلزم إجراء."
        : "راجع Heroku Metrics وLogs وحدد المسار الذي يرفع استهلاك الذاكرة.",
    details: {
      memoryUsedMb,
      memoryLimitMb,
      deploymentVersion:
        process.env["HEROKU_SLUG_COMMIT"] ?? process.env["SOURCE_VERSION"] ?? "unknown",
      nodeVersion: process.version,
    },
  });

  const previousMonitor = await admin
    .from("health_checks")
    .select("checked_at")
    .order("checked_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const previousCheckAt = previousMonitor.data?.checked_at
    ? new Date(previousMonitor.data.checked_at).getTime()
    : null;
  const monitorAgeMinutes =
    previousCheckAt === null ? null : Math.round((Date.now() - previousCheckAt) / 60_000);
  const schedulerStatus: HealthStatus =
    monitorAgeMinutes === null
      ? "unknown"
      : monitorAgeMinutes > 15 || (syncAgeMinutes !== null && syncAgeMinutes > 390)
        ? "degraded"
        : "healthy";
  checks.push({
    key: "scheduler",
    status: schedulerStatus,
    latencyMs: null,
    statusCode: null,
    summary:
      monitorAgeMinutes === null
        ? "هذه أول دورة فحص؛ سيُقاس انتظام المهام في الدورة التالية."
        : schedulerStatus === "healthy"
          ? `المهام المجدولة منتظمة؛ آخر فحص سابق منذ ${monitorAgeMinutes} دقيقة.`
          : "إحدى المهام المجدولة لم تعمل في موعدها المتوقع.",
    impact:
      schedulerStatus === "degraded"
        ? "قد تتأخر تنبيهات الأعطال أو مزامنة الفيديوهات."
        : "لا يوجد تأثير ملحوظ.",
    cause:
      schedulerStatus === "degraded"
        ? "Supabase Cron أو Edge Function أو السر الموقّع يحتاج مراجعة."
        : "Supabase Cron ينفذ حسب الجدول.",
    action:
      schedulerStatus === "degraded"
        ? "راجع Cron Jobs وEdge Function Logs في Supabase ثم شغّل الفحص يدويًا."
        : "لا يلزم إجراء.",
    details: { monitorAgeMinutes, syncAgeMinutes },
  });

  await persist(admin, checks);
  return {
    status: checks.some((check) => check.status === "down")
      ? "down"
      : checks.some((check) => check.status === "degraded")
        ? "degraded"
        : "healthy",
    checkedAt: new Date().toISOString(),
    checks,
  };
}
