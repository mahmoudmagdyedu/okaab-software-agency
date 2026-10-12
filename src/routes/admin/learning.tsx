import { createFileRoute } from "@tanstack/react-router";
import { Bell, Gauge, Save, Search, Settings2, Trash2, Users } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { AdminLayout } from "@/components/admin/AdminShell";

// Performance optimization: Cache Intl.DateTimeFormat instance to avoid recreating it
// on every render and loop iteration, which is expensive.
const arEgDateTimeFormat = new Intl.DateTimeFormat("ar-EG", {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
});

type MobileConfig = {
  min_app_version: string;
  force_update: boolean;
  maintenance_mode: boolean;
  maintenance_message?: string;
  update_message?: string;
  update_url?: string;
};
type Features = { leaderboard: boolean; streaks: boolean; signup: boolean };
type Points = Record<string, number>;
type Announcement = {
  id: string;
  title: string;
  body: string;
  audience: string;
  starts_at: string;
  ends_at: string | null;
  is_published: boolean;
};
type PlatformData = {
  config: { mobile: MobileConfig; features: Features; points_rules: Points };
  announcements: Announcement[];
  analytics: {
    summary: {
      total_learners: number;
      active_7d: number;
      completed_lessons: number;
      quiz_attempts: number;
      successful_tasks: number;
    };
    lessons: Array<{
      id: string;
      title: string;
      course_title: string;
      started: number;
      completed: number;
    }>;
    engagement: { dau: number; wau: number; mau: number };
    retention: Array<{
      day_number: number;
      eligible: number;
      returned: number;
      retention_percent: number;
    }>;
    funnel: {
      registered: number;
      started_lesson: number;
      attempted_quiz: number;
      passed_task: number;
      completed_lesson: number;
    };
    pointsDistribution: Array<{ band: string; learners: number }>;
  };
};
type Learner = {
  id: string;
  email: string;
  display_name: string;
  status: "active" | "banned" | "deleted";
  leaderboard_visible: boolean;
  points: number;
  completed_lessons: number;
  badge_count: number;
  last_activity_at: string | null;
};

export const Route = createFileRoute("/admin/learning")({
  head: () => ({
    meta: [
      { title: "إدارة منصة التعلّم — عُقاب" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: LearningAdminRoute,
});

const input =
  "h-11 w-full rounded-xl border-2 border-[var(--ok-ink)] bg-[var(--ok-paper)] px-3 text-sm outline-none focus:ring-2 focus:ring-[#E8A33D]";
const labels: Record<string, string> = {
  quiz_first_correct: "إجابة صحيحة من أول مرة",
  video_complete: "إكمال فيديو",
  interactive_complete: "إكمال درس تفاعلي",
  task_passed: "مهمة ناجحة",
  daily_activity: "نشاط يومي",
  streak_7: "مكافأة 7 أيام",
  streak_30: "مكافأة 30 يومًا",
};

function LearningAdminContent() {
  const [data, setData] = useState<PlatformData | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState("");
  const [learners, setLearners] = useState<Learner[]>([]);
  const [learnerSearch, setLearnerSearch] = useState("");
  const [pushPreview, setPushPreview] = useState({
    title: "",
    body: "",
    audience: "all",
  });
  const load = async () => {
    try {
      const response = await fetch("/api/v1/admin/platform", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok || payload.error) throw new Error(payload.error?.message || "تعذّر التحميل");
      setData(payload.data);
      setError("");
    } catch (value) {
      setError(value instanceof Error ? value.message : "تعذّر التحميل");
    }
  };
  useEffect(() => {
    void load();
  }, []);
  const loadLearners = async (query = "") => {
    const response = await fetch(`/api/v1/admin/learners?q=${encodeURIComponent(query)}`, {
      cache: "no-store",
    });
    const payload = await response.json();
    if (response.ok) setLearners(payload.data.learners);
  };
  useEffect(() => {
    void loadLearners();
  }, []);
  const learnerAction = async (body: Record<string, unknown>) => {
    const response = await fetch("/api/v1/admin/learners", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = await response.json();
    if (!response.ok || payload.error) {
      toast.error("تعذّر تحديث المتعلّم", { description: payload.error?.message });
      return;
    }
    toast.success("تم تحديث حساب المتعلّم");
    await loadLearners(learnerSearch);
  };
  const updateConfig = async (
    key: "mobile" | "features" | "points_rules",
    value: Record<string, unknown>,
  ) => {
    setSaving(key);
    try {
      const response = await fetch("/api/v1/admin/platform", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind: "config", key, value }),
      });
      const payload = await response.json();
      if (!response.ok || payload.error) throw new Error(payload.error?.message || "تعذّر الحفظ");
      toast.success("تم حفظ الإعداد وسيظهر في الموقع والتطبيق");
      await load();
    } catch (value) {
      toast.error("تعذّر الحفظ", {
        description: value instanceof Error ? value.message : undefined,
      });
    } finally {
      setSaving("");
    }
  };
  if (error && !data)
    return (
      <div className="rounded-3xl border-2 border-red-700 bg-red-50 p-6">
        <h2 className="font-bold">تعذّر تحميل إعدادات المنصة</h2>
        <p className="mt-2 text-sm">{error}</p>
        <button
          onClick={() => void load()}
          className="mt-4 rounded-xl bg-[var(--ok-ink)] px-4 py-2 text-[var(--ok-paper)]"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  if (!data)
    return (
      <div className="grid min-h-[45vh] place-items-center text-sm opacity-65">
        جاري تحميل إعدادات منصة التعلّم…
      </div>
    );
  const setMobile = (patch: Partial<MobileConfig>) =>
    setData({ ...data, config: { ...data.config, mobile: { ...data.config.mobile, ...patch } } });
  const setFeatures = (patch: Partial<Features>) =>
    setData({
      ...data,
      config: { ...data.config, features: { ...data.config.features, ...patch } },
    });
  const setPoints = (key: string, value: number) =>
    setData({
      ...data,
      config: { ...data.config, points_rules: { ...data.config.points_rules, [key]: value } },
    });
  const createAnnouncement = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const starts = new Date(String(values.get("startsAt")));
    try {
      const response = await fetch("/api/v1/admin/platform", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: values.get("title"),
          body: values.get("body"),
          audience: values.get("audience"),
          startsAt: starts.toISOString(),
          endsAt: null,
          published: values.get("published") === "on",
        }),
      });
      const payload = await response.json();
      if (!response.ok || payload.error) throw new Error(payload.error?.message || "تعذّر الإنشاء");
      toast.success("تم إنشاء الإعلان");
      form.reset();
      await load();
    } catch (value) {
      toast.error("تعذّر إنشاء الإعلان", {
        description: value instanceof Error ? value.message : undefined,
      });
    }
  };
  const removeAnnouncement = async (id: string) => {
    if (!window.confirm("حذف الإعلان نهائيًا؟")) return;
    const response = await fetch(`/api/v1/admin/platform?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (response.ok) {
      toast.success("تم حذف الإعلان");
      await load();
    } else toast.error("تعذّر حذف الإعلان");
  };
  const sendPush = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const labels = {
      all: "كل المتعلمين",
      active: "النشطون خلال 7 أيام",
      inactive_7d: "المنقطعون 7 أيام",
    } as const;
    if (
      !window.confirm(
        `إرسال هذا الإشعار الآن إلى ${labels[pushPreview.audience as keyof typeof labels]}؟\n\n${pushPreview.title}\n${pushPreview.body}`,
      )
    )
      return;
    setSaving("push");
    try {
      const response = await fetch("/api/v1/admin/push", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(pushPreview),
      });
      const payload = await response.json();
      if (!response.ok || payload.error)
        throw new Error(payload.error?.message || "تعذّر إرسال الإشعار");
      toast.success("اكتمل إرسال الإشعار", {
        description:
          payload.data.message ||
          `وصل إلى ${payload.data.sent} جهاز، وتعذّر على ${payload.data.failed}.`,
      });
      setPushPreview({ title: "", body: "", audience: "all" });
    } catch (value) {
      toast.error("تعذّر إرسال الإشعار", {
        description: value instanceof Error ? value.message : undefined,
      });
    } finally {
      setSaving("");
    }
  };
  return (
    <div className="space-y-6">
      <section
        aria-label="ملخص نشاط منصة التعلّم"
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5"
      >
        {[
          ["المتعلمون", data.analytics.summary.total_learners],
          ["نشطون خلال 7 أيام", data.analytics.summary.active_7d],
          ["دروس مكتملة", data.analytics.summary.completed_lessons],
          ["محاولات اختبار", data.analytics.summary.quiz_attempts],
          ["مهام ناجحة", data.analytics.summary.successful_tasks],
        ].map(([label, value]) => (
          <article
            key={String(label)}
            className="rounded-2xl border-2 border-[var(--ok-ink)] bg-[var(--ok-card)] p-4"
          >
            <strong className="font-display text-3xl">{value}</strong>
            <p className="mt-1 text-sm font-bold opacity-65">{label}</p>
          </article>
        ))}
      </section>
      <section className="grid gap-5 xl:grid-cols-3">
        <article className="rounded-3xl border-2 border-[var(--ok-ink)] bg-[var(--ok-card)] p-5">
          <h2 className="font-display text-2xl font-bold">النشاط</h2>
          <p className="mt-1 text-sm opacity-60">مستخدمون فريدون نفّذوا نشاطًا تعليميًا.</p>
          <dl className="mt-5 grid grid-cols-3 gap-2 text-center">
            {[
              ["يومي", data.analytics.engagement.dau],
              ["أسبوعي", data.analytics.engagement.wau],
              ["شهري", data.analytics.engagement.mau],
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded-xl bg-[var(--ok-paper)] p-3">
                <dt className="text-xs font-bold opacity-60">{label}</dt>
                <dd className="mt-1 font-display text-2xl font-bold">{value}</dd>
              </div>
            ))}
          </dl>
        </article>
        <article className="rounded-3xl border-2 border-[var(--ok-ink)] bg-[var(--ok-card)] p-5">
          <h2 className="font-display text-2xl font-bold">الاحتفاظ</h2>
          <p className="mt-1 text-sm opacity-60">نسبة من عادوا للنشاط بعد إنشاء الحساب.</p>
          <dl className="mt-5 space-y-3">
            {data.analytics.retention.map((item) => (
              <div
                key={item.day_number}
                className="flex items-center justify-between border-b border-[var(--ok-ink)]/15 pb-2 last:border-0"
              >
                <dt className="font-bold">اليوم {item.day_number}</dt>
                <dd className="font-mono font-bold" dir="ltr">
                  {item.retention_percent}%
                </dd>
              </div>
            ))}
          </dl>
        </article>
        <article className="rounded-3xl border-2 border-[var(--ok-ink)] bg-[var(--ok-card)] p-5">
          <h2 className="font-display text-2xl font-bold">مسار التعلّم</h2>
          <p className="mt-1 text-sm opacity-60">انتقال المتعلّم من الحساب إلى إكمال الدرس.</p>
          <ol className="mt-5 space-y-2 text-sm">
            {[
              ["حساب نشط", data.analytics.funnel.registered],
              ["بدأ درسًا", data.analytics.funnel.started_lesson],
              ["جرّب اختبارًا", data.analytics.funnel.attempted_quiz],
              ["نجح في مهمة", data.analytics.funnel.passed_task],
              ["أكمل درسًا", data.analytics.funnel.completed_lesson],
            ].map(([label, value], index) => (
              <li
                key={String(label)}
                className="flex items-center gap-3 rounded-xl bg-[var(--ok-paper)] px-3 py-2"
              >
                <span className="grid size-7 place-items-center rounded-full bg-[#E8A33D] font-mono font-bold text-[#181511]">
                  {index + 1}
                </span>
                <span className="flex-1 font-bold">{label}</span>
                <strong className="font-mono">{value}</strong>
              </li>
            ))}
          </ol>
        </article>
      </section>
      <section className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-3xl border-2 border-[var(--ok-ink)] bg-[var(--ok-card)] p-5">
          <div className="flex items-center gap-2">
            <Settings2 />
            <h2 className="font-display text-2xl font-bold">حالة التطبيق</h2>
          </div>
          <div className="mt-5 space-y-4">
            <label className="flex min-h-11 items-center justify-between gap-3">
              <input
                type="checkbox"
                checked={data.config.mobile.maintenance_mode}
                onChange={(event) => setMobile({ maintenance_mode: event.target.checked })}
              />
              <span className="font-bold">وضع الصيانة</span>
            </label>
            <label className="flex min-h-11 items-center justify-between gap-3">
              <input
                type="checkbox"
                checked={data.config.mobile.force_update}
                onChange={(event) => setMobile({ force_update: event.target.checked })}
              />
              <span className="font-bold">إجبار تحديث التطبيق</span>
            </label>
            <label className="grid gap-2 text-sm font-bold">
              أقل إصدار مسموح
              <input
                className={input}
                dir="ltr"
                value={data.config.mobile.min_app_version}
                onChange={(event) => setMobile({ min_app_version: event.target.value })}
              />
            </label>
            <label className="grid gap-2 text-sm font-bold">
              رسالة الصيانة
              <textarea
                className={`${input} h-24 py-3`}
                value={data.config.mobile.maintenance_message || ""}
                onChange={(event) => setMobile({ maintenance_message: event.target.value })}
              />
            </label>
            <label className="grid gap-2 text-sm font-bold">
              رابط التحديث
              <input
                className={input}
                dir="ltr"
                value={data.config.mobile.update_url || ""}
                onChange={(event) => setMobile({ update_url: event.target.value })}
              />
            </label>
            <button
              disabled={saving === "mobile"}
              onClick={() => void updateConfig("mobile", data.config.mobile)}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--ok-ink)] font-bold text-[var(--ok-paper)]"
            >
              <Save size={17} /> حفظ حالة التطبيق
            </button>
          </div>
        </div>
        <div className="rounded-3xl border-2 border-[var(--ok-ink)] bg-[var(--ok-card)] p-5">
          <div className="flex items-center gap-2">
            <Gauge />
            <h2 className="font-display text-2xl font-bold">الخصائص والنقاط</h2>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {Object.entries(data.config.features).map(([key, value]) => (
              <label
                key={key}
                className="flex min-h-11 items-center justify-between rounded-xl border border-[var(--ok-ink)]/20 px-3"
              >
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(event) => setFeatures({ [key]: event.target.checked })}
                />
                <span className="font-bold">
                  {key === "leaderboard"
                    ? "المتصدرون"
                    : key === "streaks"
                      ? "السلسلة اليومية"
                      : "إنشاء الحساب"}
                </span>
              </label>
            ))}
          </div>
          <button
            disabled={saving === "features"}
            onClick={() => void updateConfig("features", data.config.features)}
            className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--ok-ink)] font-bold text-[var(--ok-paper)]"
          >
            <Save size={17} /> حفظ الخصائص
          </button>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {Object.entries(data.config.points_rules).map(([key, value]) => (
              <label key={key} className="grid gap-1 text-sm font-bold">
                {labels[key] || key}
                <input
                  type="number"
                  min="0"
                  max="10000"
                  className={input}
                  value={value}
                  onChange={(event) => setPoints(key, Math.max(0, Number(event.target.value)))}
                />
              </label>
            ))}
          </div>
          <button
            disabled={saving === "points_rules"}
            onClick={() => void updateConfig("points_rules", data.config.points_rules)}
            className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#E8A33D] font-bold text-[#181511]"
          >
            <Save size={17} /> حفظ قيم النقاط
          </button>
        </div>
      </section>
      <section className="overflow-hidden rounded-3xl border-2 border-[var(--ok-ink)] bg-[var(--ok-card)]">
        <div className="flex flex-col gap-3 border-b-2 border-[var(--ok-ink)] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Users />
            <h2 className="font-display text-2xl font-bold">المتعلمون</h2>
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void loadLearners(learnerSearch);
            }}
            className="flex gap-2"
          >
            <input
              value={learnerSearch}
              onChange={(event) => setLearnerSearch(event.target.value)}
              placeholder="الاسم أو البريد"
              className={input}
            />
            <button
              aria-label="بحث"
              className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--ok-ink)] text-[var(--ok-paper)]"
            >
              <Search size={18} />
            </button>
          </form>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-sm">
            <thead className="bg-[var(--ok-paper)]/70">
              <tr>
                <th className="p-3 text-right">المتعلم</th>
                <th className="p-3">النقاط</th>
                <th className="p-3">الدروس</th>
                <th className="p-3">الشارات</th>
                <th className="p-3">الحالة</th>
                <th className="p-3">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--ok-ink)]/10">
              {learners.map((learner) => (
                <tr key={learner.id}>
                  <td className="p-3">
                    <strong>{learner.display_name}</strong>
                    <span className="block opacity-55" dir="ltr">
                      {learner.email}
                    </span>
                  </td>
                  <td className="p-3 text-center font-bold">{learner.points}</td>
                  <td className="p-3 text-center">{learner.completed_lessons}</td>
                  <td className="p-3 text-center">{learner.badge_count}</td>
                  <td className="p-3 text-center">
                    {learner.status === "active"
                      ? "نشط"
                      : learner.status === "banned"
                        ? "موقوف"
                        : "محذوف"}
                  </td>
                  <td className="p-3">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => {
                          const raw = window.prompt("اكتب عدد النقاط، ويمكن استخدام رقم سالب");
                          const reason = raw ? window.prompt("اكتب سبب التعديل (إلزامي)") : null;
                          if (raw && reason)
                            void learnerAction({
                              action: "points",
                              userId: learner.id,
                              amount: Number(raw),
                              reason,
                            });
                        }}
                        className="rounded-lg border border-[var(--ok-ink)] px-3 py-2 font-bold"
                      >
                        نقاط
                      </button>
                      <button
                        onClick={() =>
                          void learnerAction({
                            action: "visibility",
                            userId: learner.id,
                            visible: !learner.leaderboard_visible,
                          })
                        }
                        className="rounded-lg border border-[var(--ok-ink)] px-3 py-2"
                      >
                        {learner.leaderboard_visible ? "إخفاء" : "إظهار"}
                      </button>
                      {learner.status !== "deleted" && (
                        <button
                          onClick={() =>
                            void learnerAction({
                              action: "status",
                              userId: learner.id,
                              status: learner.status === "active" ? "banned" : "active",
                            })
                          }
                          className="rounded-lg border border-red-700 px-3 py-2 text-red-700"
                        >
                          {learner.status === "active" ? "إيقاف" : "تفعيل"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {learners.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center opacity-60">
                    لا توجد حسابات مطابقة.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      <section className="overflow-hidden rounded-3xl border-2 border-[var(--ok-ink)] bg-[var(--ok-card)]">
        <div className="border-b-2 border-[var(--ok-ink)] p-5">
          <h2 className="font-display text-2xl font-bold">تقدّم الدروس</h2>
          <p className="mt-1 text-sm opacity-60">أكثر الدروس بدءًا ونسبة إكمال كل درس.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-sm">
            <thead className="bg-[var(--ok-paper)]/70">
              <tr>
                <th className="p-3 text-right">الدرس</th>
                <th className="p-3 text-right">الكورس</th>
                <th className="p-3 text-center">بدأه</th>
                <th className="p-3 text-center">أكمله</th>
                <th className="p-3 text-center">نسبة الإكمال</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--ok-ink)]/10">
              {data.analytics.lessons.map((lesson) => {
                const completion = lesson.started
                  ? Math.round((lesson.completed / lesson.started) * 100)
                  : 0;
                return (
                  <tr key={lesson.id}>
                    <td className="p-3 font-bold">{lesson.title}</td>
                    <td className="p-3 opacity-70">{lesson.course_title}</td>
                    <td className="p-3 text-center">{lesson.started}</td>
                    <td className="p-3 text-center">{lesson.completed}</td>
                    <td className="p-3 text-center font-bold">{completion}%</td>
                  </tr>
                );
              })}
              {data.analytics.lessons.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center opacity-60">
                    ستظهر بيانات التقدّم بعد بدء المتعلمين للدروس.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.65fr)]">
        <div className="overflow-hidden rounded-3xl border-2 border-[var(--ok-ink)] bg-[var(--ok-card)]">
          <div className="border-b-2 border-[var(--ok-ink)] p-5">
            <h2 className="font-display text-2xl font-bold">الإعلانات</h2>
          </div>
          <div className="divide-y divide-[var(--ok-ink)]/15">
            {data.announcements.map((item) => (
              <article key={item.id} className="flex items-start gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold">{item.title}</h3>
                  <p className="mt-1 text-sm opacity-70">{item.body}</p>
                  <p className="mt-2 text-xs opacity-50">
                    {item.is_published ? "منشور" : "مسودة"} ·{" "}
                    {arEgDateTimeFormat.format(new Date(item.starts_at))}
                  </p>
                </div>
                <button
                  aria-label="حذف الإعلان"
                  onClick={() => void removeAnnouncement(item.id)}
                  className="grid size-10 shrink-0 place-items-center rounded-xl border border-red-700 text-red-700"
                >
                  <Trash2 size={17} />
                </button>
              </article>
            ))}
            {data.announcements.length === 0 && (
              <p className="p-8 text-center text-sm opacity-60">لا توجد إعلانات حاليًا.</p>
            )}
          </div>
        </div>
        <form
          onSubmit={createAnnouncement}
          className="rounded-3xl border-2 border-[var(--ok-ink)] bg-[var(--ok-card)] p-5"
        >
          <div className="flex items-center gap-2">
            <Bell />
            <h2 className="font-display text-2xl font-bold">إعلان جديد</h2>
          </div>
          <div className="mt-5 grid gap-3">
            <input required name="title" placeholder="عنوان الإعلان" className={input} />
            <textarea
              required
              name="body"
              placeholder="النص الذي سيظهر للمتعلمين"
              className={`${input} h-28 py-3`}
            />
            <select name="audience" className={input}>
              <option value="all">كل المتعلمين</option>
              <option value="active">النشطون</option>
              <option value="inactive_7d">المنقطعون 7 أيام</option>
            </select>
            <label className="grid gap-2 text-sm font-bold">
              وقت البداية
              <input
                required
                name="startsAt"
                type="datetime-local"
                defaultValue={new Date(Date.now() + 60_000).toISOString().slice(0, 16)}
                className={input}
              />
            </label>
            <label className="flex min-h-11 items-center gap-2 font-bold">
              <input name="published" type="checkbox" /> نشر فورًا
            </label>
            <button className="h-11 rounded-xl bg-[var(--ok-ink)] font-bold text-[var(--ok-paper)]">
              إنشاء الإعلان
            </button>
          </div>
        </form>
      </section>
      <section className="grid gap-5 rounded-3xl border-2 border-[var(--ok-ink)] bg-[var(--ok-card)] p-5 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.7fr)]">
        <form onSubmit={sendPush} className="grid gap-3">
          <div className="flex items-center gap-2">
            <Bell />
            <div>
              <h2 className="font-display text-2xl font-bold">إشعار للتطبيق</h2>
              <p className="text-sm opacity-60">
                رسالة فورية اختيارية بحد أقصى 3 مرات خلال 7 أيام.
              </p>
            </div>
          </div>
          <input
            required
            minLength={3}
            maxLength={100}
            value={pushPreview.title}
            onChange={(event) => setPushPreview({ ...pushPreview, title: event.target.value })}
            placeholder="عنوان الإشعار"
            className={input}
          />
          <textarea
            required
            minLength={3}
            maxLength={500}
            value={pushPreview.body}
            onChange={(event) => setPushPreview({ ...pushPreview, body: event.target.value })}
            placeholder="النص المختصر الذي سيظهر على الهاتف"
            className={`${input} h-28 py-3`}
          />
          <select
            value={pushPreview.audience}
            onChange={(event) => setPushPreview({ ...pushPreview, audience: event.target.value })}
            className={input}
          >
            <option value="all">كل المتعلمين</option>
            <option value="active">النشطون خلال 7 أيام</option>
            <option value="inactive_7d">المنقطعون 7 أيام</option>
          </select>
          <button
            disabled={saving === "push"}
            className="h-11 rounded-xl bg-[var(--ok-ink)] font-bold text-[var(--ok-paper)] disabled:opacity-50"
          >
            {saving === "push" ? "جاري الإرسال…" : "مراجعة وإرسال"}
          </button>
        </form>
        <aside className="rounded-2xl bg-[var(--ok-paper)] p-5" aria-label="معاينة الإشعار">
          <p className="text-xs font-bold opacity-55">معاينة على الهاتف</p>
          <div className="mt-4 rounded-2xl border border-[var(--ok-ink)]/20 bg-[var(--ok-card)] p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#E8A33D] font-black text-black">
                ع
              </div>
              <div className="min-w-0">
                <h3 className="truncate font-bold">{pushPreview.title || "عنوان الإشعار"}</h3>
                <p className="mt-1 text-sm opacity-65">
                  {pushPreview.body || "سيظهر نص الرسالة هنا قبل الإرسال."}
                </p>
              </div>
            </div>
          </div>
          <p className="mt-4 text-xs leading-6 opacity-55">
            سيظهر تأكيد أخير قبل الإرسال، وتُسجّل العملية والنتيجة في سجل التدقيق.
          </p>
        </aside>
      </section>
    </div>
  );
}

function LearningAdminRoute() {
  return (
    <AdminLayout title="منصة التعلّم">
      <LearningAdminContent />
    </AdminLayout>
  );
}
