import type { SupabaseClient } from "npm:@supabase/supabase-js@2.112.1";

type Status = "healthy" | "degraded" | "down" | "unknown";
type Check = {
  key: string;
  status: Status;
  latency_ms: number | null;
  status_code: number | null;
  summary_ar: string;
  impact_ar: string;
  likely_cause_ar: string;
  action_ar: string;
  safe_details?: Record<string, unknown>;
  deployment_version?: string | null;
};

async function httpCheck(key: string, url: string, label: string): Promise<Check> {
  const started = performance.now();
  try {
    const response = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(12_000) });
    const latency = Math.round(performance.now() - started);
    const status: Status = response.ok
      ? latency > 2500
        ? "degraded"
        : "healthy"
      : response.status >= 500
        ? "down"
        : "degraded";
    return {
      key,
      status,
      latency_ms: latency,
      status_code: response.status,
      summary_ar: response.ok
        ? `${label} يعمل${latency > 2500 ? " لكنه بطيء" : " بصورة طبيعية"}.`
        : `${label} أعاد HTTP ${response.status}.`,
      impact_ar: response.ok ? "لا يوجد تأثير ملحوظ." : `قد لا يستطيع الزائر استخدام ${label}.`,
      likely_cause_ar: response.ok
        ? "الخدمة تستجيب من نقطة مراقبة مستقلة."
        : "قد يكون هناك نشر غير مكتمل أو عطل في الخادم أو الدومين.",
      action_ar: response.ok
        ? "لا يلزم إجراء الآن."
        : "راجع Heroku Logs وآخر نشر وإعدادات الدومين.",
      safe_details: { finalUrl: response.url },
    };
  } catch (error) {
    return {
      key,
      status: "down",
      latency_ms: Math.round(performance.now() - started),
      status_code: null,
      summary_ar: `${label} لا يستجيب.`,
      impact_ar: `الزوار لا يستطيعون الوصول إلى ${label}.`,
      likely_cause_ar: "الخادم متوقف أو DNS/HTTPS لا يعمل أو انتهت مهلة الاتصال.",
      action_ar: "افحص Heroku والدومين والشهادة ثم أعد تشغيل التطبيق إذا لزم.",
      safe_details: { error: error instanceof Error ? error.name : "network_error" },
    };
  }
}

async function sendEmail(subject: string, html: string, recipients: string[]) {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key || !recipients.length) return;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({
      from: "Okaab Health <noreply@okaab.org>",
      to: recipients,
      subject,
      html,
    }),
    signal: AbortSignal.timeout(12_000),
  });
}

async function persist(admin: SupabaseClient, checks: Check[]) {
  const servicesResult = await admin.from("health_services").select("*");
  if (servicesResult.error) throw servicesResult.error;
  const services = new Map((servicesResult.data ?? []).map((service) => [service.key, service]));
  const adminsResult = await admin
    .from("profiles")
    .select("id,email")
    .in("role", ["super_admin", "admin"])
    .eq("is_active", true);
  const recipients = adminsResult.data ?? [];
  for (const check of checks) {
    const service = services.get(check.key);
    if (!service) continue;
    await admin.from("health_checks").insert({ service_id: service.id, ...check });
    const open = (
      await admin
        .from("health_incidents")
        .select("*")
        .eq("service_id", service.id)
        .is("resolved_at", null)
        .maybeSingle()
    ).data;
    if (!["healthy", "unknown"].includes(check.status) && !open) {
      const incident = await admin
        .from("health_incidents")
        .insert({
          service_id: service.id,
          status: check.status,
          title_ar: `مشكلة في ${service.name_ar}`,
          summary_ar: check.summary_ar,
          impact_ar: check.impact_ar,
          likely_cause_ar: check.likely_cause_ar,
          action_ar: check.action_ar,
          last_alerted_at: new Date().toISOString(),
        })
        .select("id")
        .single();
      if (incident.data && recipients.length)
        await admin.from("admin_notifications").insert(
          recipients.map((person) => ({
            recipient_id: person.id,
            incident_id: incident.data.id,
            title_ar: `تنبيه: ${service.name_ar}`,
            body_ar: `${check.summary_ar} ${check.action_ar}`,
          })),
        );
      await sendEmail(
        `تنبيه عُقاب: ${service.name_ar}`,
        `<div dir="rtl"><h2>${check.summary_ar}</h2><p>${check.impact_ar}</p><p>${check.action_ar}</p></div>`,
        recipients.map((p) => p.email),
      );
    } else if (check.status === "healthy" && open) {
      await admin
        .from("health_incidents")
        .update({ resolved_at: new Date().toISOString(), status: "healthy" })
        .eq("id", open.id);
      await sendEmail(
        `تم حل مشكلة ${service.name_ar}`,
        `<div dir="rtl"><h2>عادت الخدمة للعمل</h2><p>${check.summary_ar}</p></div>`,
        recipients.map((p) => p.email),
      );
    } else if (open && open.status !== check.status)
      await admin
        .from("health_incidents")
        .update({
          status: check.status,
          summary_ar: check.summary_ar,
          impact_ar: check.impact_ar,
          likely_cause_ar: check.likely_cause_ar,
          action_ar: check.action_ar,
        })
        .eq("id", open.id);
  }
}

export async function runHealth(admin: SupabaseClient) {
  const checks = await Promise.all([
    httpCheck("website", "https://okaab.org/", "الموقع الرئيسي"),
    httpCheck("courses", "https://okaab.org/courses", "منصة الكورسات"),
    httpCheck("admin", "https://okaab.org/admin/login", "صفحة دخول الإدارة"),
    httpCheck(
      "youtube",
      "https://www.youtube.com/feeds/videos.xml?channel_id=UCBAEq8qb5_yvj6_Ef96agOg",
      "اتصال YouTube",
    ),
    httpCheck("tls", "https://okaab.org/api/health", "DNS وHTTPS وشهادة الأمان"),
  ]);
  const runtimeResponse = await fetch("https://okaab.org/api/health", {
    signal: AbortSignal.timeout(10_000),
  }).catch(() => null);
  const runtime = runtimeResponse?.ok ? await runtimeResponse.json().catch(() => ({})) : {};
  checks.push({
    key: "runtime",
    status: runtimeResponse?.ok ? (runtime.memoryMb > 450 ? "degraded" : "healthy") : "down",
    latency_ms: null,
    status_code: runtimeResponse?.status ?? null,
    summary_ar: runtimeResponse?.ok
      ? `الخادم يعمل ويستخدم ${runtime.memoryMb ?? "?"} ميجابايت.`
      : "تعذّر قراءة حالة Heroku.",
    impact_ar: runtimeResponse?.ok ? "لا يوجد تأثير ملحوظ." : "قد تكون صفحات الموقع متوقفة.",
    likely_cause_ar: runtimeResponse?.ok ? "نسخة النشر تستجيب." : "Dyno متوقف أو آخر نشر فشل.",
    action_ar: runtimeResponse?.ok ? "لا يلزم إجراء." : "راجع Heroku Dynos وLogs.",
    safe_details: {
      memoryMb: runtime.memoryMb ?? null,
      uptimeSeconds: runtime.uptimeSeconds ?? null,
    },
    deployment_version: runtime.version ?? null,
  });

  const databaseStarted = performance.now();
  const sync = await admin.from("youtube_sync_state").select("*").limit(1).maybeSingle();
  checks.push({
    key: "database",
    status: sync.error ? "down" : "healthy",
    latency_ms: Math.round(performance.now() - databaseStarted),
    status_code: null,
    summary_ar: sync.error ? "قاعدة البيانات لا تستجيب." : "قاعدة البيانات تعمل بصورة طبيعية.",
    impact_ar: sync.error ? "الدخول والمهام والكورسات قد لا تعمل." : "لا يوجد تأثير.",
    likely_cause_ar: sync.error ? "Lovable Cloud أو قاعدة البيانات يحتاج مراجعة." : "القراءة نجحت.",
    action_ar: sync.error ? "راجع Database وLogs." : "لا يلزم إجراء.",
    safe_details: { errorCode: sync.error?.code ?? null },
  });

  const storageStarted = performance.now();
  const probe = await admin.storage
    .from("course-slides")
    .upload(".health/probe.txt", new Blob(["okaab-storage-health"]), {
      contentType: "text/plain",
      upsert: true,
    });
  const probeRead = probe.error
    ? null
    : await admin.storage.from("course-slides").download(".health/probe.txt");
  const storageError = probe.error ?? probeRead?.error ?? null;
  checks.push({
    key: "storage",
    status: storageError ? "down" : "healthy",
    latency_ms: Math.round(performance.now() - storageStarted),
    status_code: null,
    summary_ar: storageError ? "تعذّر فحص Storage." : "تمت كتابة وقراءة ملف فحص Storage.",
    impact_ar: storageError ? "رفع وعرض Slides قد يفشل." : "لا يوجد تأثير.",
    likely_cause_ar: storageError
      ? "Bucket أو سياسات Storage تحتاج مراجعة."
      : "الرفع والقراءة يعملان.",
    action_ar: storageError ? "راجع course-slides وسياسات Storage." : "لا يلزم إجراء.",
    safe_details: { probe: storageError ? "failed" : "ok" },
  });

  const authStarted = performance.now();
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const anon = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const auth = await fetch(`${url}/auth/v1/health`, {
    headers: { apikey: anon },
    signal: AbortSignal.timeout(8_000),
  }).catch(() => null);
  checks.push({
    key: "auth",
    status: auth?.ok ? "healthy" : "down",
    latency_ms: Math.round(performance.now() - authStarted),
    status_code: auth?.status ?? null,
    summary_ar: auth?.ok ? "خدمة تسجيل الدخول تستجيب." : "خدمة تسجيل الدخول لا تستجيب.",
    impact_ar: auth?.ok ? "لا يوجد تأثير." : "لن تعمل روابط الدخول.",
    likely_cause_ar: auth?.ok ? "Auth متاح." : "عطل في Auth أو إعداداته.",
    action_ar: auth?.ok ? "لا يلزم إجراء." : "راجع Auth Logs وروابط الدخول.",
  });

  const emailStarted = performance.now();
  const resend = Deno.env.get("RESEND_API_KEY");
  const email = resend
    ? await fetch("https://api.resend.com/domains", {
        headers: { Authorization: `Bearer ${resend}` },
        signal: AbortSignal.timeout(8_000),
      }).catch(() => null)
    : null;
  checks.push({
    key: "email",
    status: email?.ok ? "healthy" : "degraded",
    latency_ms: Math.round(performance.now() - emailStarted),
    status_code: email?.status ?? null,
    summary_ar: email?.ok ? "خدمة البريد جاهزة." : "تعذّر تأكيد جاهزية البريد.",
    impact_ar: email?.ok ? "لا يوجد تأثير." : "قد تتأخر الروابط والتنبيهات.",
    likely_cause_ar: email?.ok ? "Resend يقبل المفتاح." : "المفتاح أو الدومين يحتاج مراجعة.",
    action_ar: email?.ok ? "لا يلزم إجراء." : "راجع RESEND_API_KEY ودومين okaab.org.",
  });

  const previous = await admin
    .from("health_checks")
    .select("checked_at")
    .order("checked_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const monitorAge = previous.data?.checked_at
    ? Math.round((Date.now() - new Date(previous.data.checked_at).getTime()) / 60_000)
    : null;
  const syncAge = sync.data?.last_success_at
    ? Math.round((Date.now() - new Date(sync.data.last_success_at).getTime()) / 60_000)
    : null;
  const scheduled: Status =
    monitorAge === null
      ? "unknown"
      : monitorAge > 15 || (syncAge !== null && syncAge > 390)
        ? "degraded"
        : "healthy";
  checks.push({
    key: "scheduler",
    status: scheduled,
    latency_ms: null,
    status_code: null,
    summary_ar:
      monitorAge === null
        ? "هذه أول دورة فحص."
        : scheduled === "healthy"
          ? `المهام منتظمة؛ آخر فحص منذ ${monitorAge} دقيقة.`
          : "إحدى المهام المجدولة متأخرة.",
    impact_ar: scheduled === "degraded" ? "قد تتأخر التنبيهات أو الفيديوهات." : "لا يوجد تأثير.",
    likely_cause_ar:
      scheduled === "degraded" ? "Job أو Edge Function أو السر يحتاج مراجعة." : "الجدول يعمل.",
    action_ar: scheduled === "degraded" ? "راجع Jobs وEdge Function Logs." : "لا يلزم إجراء.",
    safe_details: { monitorAgeMinutes: monitorAge, syncAgeMinutes: syncAge },
  });
  await persist(admin, checks);
  return {
    status: checks.some((c) => c.status === "down")
      ? "down"
      : checks.some((c) => c.status === "degraded")
        ? "degraded"
        : "healthy",
    checkedAt: new Date().toISOString(),
    checks,
  };
}
