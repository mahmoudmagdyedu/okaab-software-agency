import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  HelpCircle,
  RefreshCw,
  Shield,
  Wrench,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { AdminLayout, useAdminAuth } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import type {
  HealthCheck,
  HealthIncident,
  HealthService,
  HealthStatus,
} from "@/integrations/supabase/types";

export const Route = createFileRoute("/admin/health")({
  head: () => ({
    meta: [{ title: "حالة النظام — إدارة عُقاب" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: HealthRoute,
});

const STATUS: Record<HealthStatus, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  healthy: { label: "يعمل طبيعيًا", color: "#62b77a", icon: CheckCircle2 },
  degraded: { label: "يحتاج انتباه", color: "#E8A33D", icon: AlertTriangle },
  down: { label: "متوقف", color: "#d65d4a", icon: AlertTriangle },
  unknown: { label: "غير معروف", color: "#999087", icon: HelpCircle },
};

function HealthContent() {
  const { profile } = useAdminAuth();
  const [services, setServices] = useState<HealthService[]>([]);
  const [checks, setChecks] = useState<HealthCheck[]>([]);
  const [incidents, setIncidents] = useState<HealthIncident[]>([]);
  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);

  async function load() {
    const [serviceResult, checkResult, incidentResult] = await Promise.all([
      supabase.from("health_services").select("*").eq("is_enabled", true).order("sort_order"),
      supabase
        .from("health_checks")
        .select("*")
        .order("checked_at", { ascending: false })
        .limit(500),
      supabase
        .from("health_incidents")
        .select("*")
        .order("started_at", { ascending: false })
        .limit(50),
    ]);
    setServices((serviceResult.data ?? []) as HealthService[]);
    setChecks((checkResult.data ?? []) as HealthCheck[]);
    setIncidents((incidentResult.data ?? []) as HealthIncident[]);
  }
  useEffect(() => {
    void load();
  }, []);

  const latest = useMemo(
    () =>
      new Map(
        services.map((service) => [
          service.id,
          checks.find((check) => check.service_id === service.id),
        ]),
      ),
    [services, checks],
  );
  const hasMissingChecks =
    services.length === 0 || services.some((service) => !latest.get(service.id));
  const overall: HealthStatus = services.some(
    (service) => latest.get(service.id)?.status === "down",
  )
    ? "down"
    : services.some((service) => latest.get(service.id)?.status === "degraded")
      ? "degraded"
      : hasMissingChecks
        ? "unknown"
        : "healthy";
  const overallStyle = STATUS[overall];

  async function runNow() {
    setRunning(true);
    setRunError(null);
    try {
      const session = await supabase.auth.getSession();
      const accessToken = session.data.session?.access_token;
      if (!accessToken) throw new Error("انتهت جلسة الدخول. سجّل الدخول مرة أخرى ثم أعد المحاولة.");

      const response = await fetch("/api/admin/health/run", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const responseText = await response.text();
      let payload: { error?: string; message?: string } = {};
      try {
        payload = responseText ? (JSON.parse(responseText) as typeof payload) : {};
      } catch {
        payload = {};
      }

      if (!response.ok) {
        const description =
          response.status === 404
            ? "خدمة الفحص الخلفية لم تُنشر بعد على Supabase. انشر Edge Functions ثم أعد الفحص."
            : response.status === 401
              ? "جلسة الدخول غير صالحة أو انتهت. سجّل الدخول مرة أخرى."
              : payload.error ||
                payload.message ||
                `تعذّر تشغيل خدمة الفحص (HTTP ${response.status}).`;
        setRunError(description);
        toast.error("لم يكتمل الفحص", { description });
        return;
      }

      toast.success("اكتمل الفحص وتحديث النتائج");
      await load();
    } catch (error) {
      const description = error instanceof Error ? error.message : "تعذّر الاتصال بخدمة الفحص.";
      setRunError(description);
      toast.error("لم يكتمل الفحص", { description });
    } finally {
      setRunning(false);
    }
  }

  if (!profile || !["super_admin", "admin"].includes(profile.role))
    return (
      <div className="rounded-3xl border-2 border-[var(--ok-ink)] bg-[var(--ok-card)] p-8 text-center">
        <Shield className="mx-auto" size={42} />
        <h2 className="mt-4 font-display text-2xl font-bold">
          حالة النظام للأدمن والسوبر أدمن فقط
        </h2>
      </div>
    );

  return (
    <div className="space-y-6">
      <section
        className="flex flex-col gap-5 rounded-[2rem] border-2 border-[var(--ok-ink)] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8"
        style={{ background: `color-mix(in srgb, ${overallStyle.color} 18%, var(--ok-card))` }}
      >
        <div className="flex items-center gap-4">
          <span
            className="grid size-14 place-items-center rounded-full border-2 border-[var(--ok-ink)] text-[#181511]"
            style={{ backgroundColor: overallStyle.color }}
          >
            {<overallStyle.icon size={27} />}
          </span>
          <div>
            <p className="text-sm font-bold opacity-65">الصورة العامة الآن</p>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">{overallStyle.label}</h2>
            <p className="mt-2 text-sm opacity-65">
              الفحص الخارجي يعمل كل 5 دقائق ويرسل بريدًا فقط عند تغير الحالة.
            </p>
          </div>
        </div>
        <button
          type="button"
          disabled={running}
          onClick={() => void runNow()}
          className="flex h-12 items-center justify-center gap-2 rounded-xl border-2 border-[var(--ok-ink)] bg-[var(--ok-ink)] px-5 font-bold text-[var(--ok-paper)] disabled:opacity-60"
        >
          <RefreshCw size={18} className={running ? "animate-spin" : ""} />
          {running ? "يفحص الآن…" : "تشغيل فحص كامل"}
        </button>
      </section>

      {runError && (
        <section
          role="alert"
          className="flex flex-col gap-4 rounded-2xl border-2 border-[#d65d4a] bg-red-500/10 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex min-w-0 items-start gap-3">
            <AlertTriangle className="mt-0.5 shrink-0 text-[#d65d4a]" size={22} />
            <div className="min-w-0">
              <h3 className="font-display text-lg font-bold">لم يكتمل الفحص</h3>
              <p className="mt-1 break-words text-sm leading-6 opacity-75">{runError}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setRunError(null)}
            className="shrink-0 self-start rounded-full border border-current px-4 py-2 text-sm font-bold sm:self-center"
          >
            إخفاء
          </button>
        </section>
      )}

      <section className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {services.map((service) => {
          const check = latest.get(service.id);
          const state = STATUS[check?.status ?? "unknown"];
          const Icon = state.icon;
          return (
            <article
              key={service.id}
              className="rounded-3xl border-2 border-[var(--ok-ink)] bg-[var(--ok-card)] p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className="grid size-11 place-items-center rounded-2xl border-2 border-[var(--ok-ink)] text-[#181511]"
                    style={{ backgroundColor: state.color }}
                  >
                    <Icon size={20} />
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-bold">{service.name_ar}</h3>
                    <p className="text-xs font-bold" style={{ color: state.color }}>
                      {state.label}
                    </p>
                  </div>
                </div>
                {check?.latency_ms != null && (
                  <span
                    dir="ltr"
                    className="rounded-full bg-[var(--ok-paper)] px-2 py-1 text-xs font-bold"
                  >
                    {check.latency_ms} ms
                  </span>
                )}
              </div>
              <p className="mt-4 text-sm leading-6 opacity-65">
                {check?.summary_ar ?? service.description_ar}
              </p>
              <div className="mt-4 space-y-3 border-t border-[var(--ok-ink)]/15 pt-4 text-sm">
                <div>
                  <p className="flex items-center gap-2 font-bold">
                    <Activity size={15} />
                    التأثير
                  </p>
                  <p className="mt-1 leading-6 opacity-65">
                    {check?.impact_ar || "لم يصل أول فحص بعد."}
                  </p>
                </div>
                <div>
                  <p className="flex items-center gap-2 font-bold">
                    <HelpCircle size={15} />
                    السبب المتوقع
                  </p>
                  <p className="mt-1 leading-6 opacity-65">
                    {check?.likely_cause_ar || "سيظهر بعد الفحص."}
                  </p>
                </div>
                <div className="rounded-xl bg-[var(--ok-paper)] p-3">
                  <p className="flex items-center gap-2 font-bold">
                    <Wrench size={15} />
                    ماذا أفعل؟
                  </p>
                  <p className="mt-1 leading-6 opacity-70">
                    {check?.action_ar || "شغّل الفحص الكامل."}
                  </p>
                </div>
              </div>
              {check && (
                <p className="mt-4 flex items-center gap-1.5 text-xs opacity-45">
                  <Clock3 size={13} />
                  آخر فحص: {new Date(check.checked_at).toLocaleString("ar-EG")}
                </p>
              )}
            </article>
          );
        })}
      </section>

      <section className="overflow-hidden rounded-3xl border-2 border-[var(--ok-ink)] bg-[var(--ok-card)]">
        <div className="border-b-2 border-[var(--ok-ink)] p-5">
          <h2 className="font-display text-2xl font-bold">سجل المشكلات</h2>
          <p className="mt-1 text-sm opacity-60">
            تُفتح المشكلة مرة واحدة وتُغلق تلقائيًا عند التعافي.
          </p>
        </div>
        <div className="divide-y divide-[var(--ok-ink)]/15">
          {incidents.map((incident) => (
            <article
              key={incident.id}
              className="grid gap-3 p-5 lg:grid-cols-[1fr_180px] lg:items-center"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold">{incident.title_ar}</h3>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-bold ${incident.resolved_at ? "bg-green-500/15 text-[var(--ok-success-text)]" : "bg-red-500/15 text-[var(--ok-error-text)]"}`}
                  >
                    {incident.resolved_at ? "تم الحل" : "مفتوحة"}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 opacity-65">{incident.summary_ar}</p>
                <p className="mt-2 text-sm font-bold">
                  الإجراء: <span className="font-normal opacity-70">{incident.action_ar}</span>
                </p>
              </div>
              <div className="text-xs opacity-50">
                <p>بدأت: {new Date(incident.started_at).toLocaleString("ar-EG")}</p>
                {incident.resolved_at && (
                  <p className="mt-1">
                    حُلّت: {new Date(incident.resolved_at).toLocaleString("ar-EG")}
                  </p>
                )}
              </div>
            </article>
          ))}
          {incidents.length === 0 && (
            <div className="p-9 text-center">
              <CheckCircle2 className="mx-auto text-[var(--ok-success-text)]" size={38} />
              <p className="mt-3 font-bold">لا توجد مشكلات مسجلة</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function HealthRoute() {
  return (
    <AdminLayout title="حالة النظام">
      <HealthContent />
    </AdminLayout>
  );
}
