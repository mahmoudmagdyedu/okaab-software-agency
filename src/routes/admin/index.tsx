import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, ArrowUpLeft, BookOpen, CalendarCheck, Users } from "lucide-react";
import { useEffect, useState } from "react";

import { AdminLayout, useAdminAuth } from "@/components/admin/AdminShell";
import { okaab as supabase } from "@/integrations/okaab/client";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [{ title: "لوحة الإدارة — عُقاب" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: AdminDashboardRoute,
});

type Stats = { tasks: number; people: number; courses: number; incidents: number };

function DashboardContent() {
  const { profile } = useAdminAuth();
  const [stats, setStats] = useState<Stats>({ tasks: 0, people: 0, courses: 0, incidents: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    void Promise.all([
      supabase
        .from("tasks")
        .select("id", { count: "exact", head: true })
        .gte("starts_at", start.toISOString())
        .lt("starts_at", end.toISOString()),
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("is_active", true),
      supabase.from("courses").select("id", { count: "exact", head: true }),
      supabase
        .from("health_incidents")
        .select("id", { count: "exact", head: true })
        .is("resolved_at", null),
    ]).then(([tasks, people, courses, incidents]) => {
      setStats({
        tasks: tasks.count ?? 0,
        people: people.count ?? 0,
        courses: courses.count ?? 0,
        incidents: incidents.count ?? 0,
      });
      setLoading(false);
    });
  }, []);

  const cards = [
    {
      label: "مهام اليوم",
      value: stats.tasks,
      icon: CalendarCheck,
      to: "/admin/tasks",
      color: "#E8A33D",
    },
    {
      label: profile?.role === "employee" ? "ملفي" : "أعضاء الفريق",
      value: stats.people,
      icon: Users,
      to: "/admin/team",
      color: "#70B7A5",
    },
    {
      label: "الكورسات",
      value: stats.courses,
      icon: BookOpen,
      to: "/admin/courses",
      color: "#8094D8",
    },
    {
      label: "مشكلات تحتاج تدخل",
      value: stats.incidents,
      icon: Activity,
      to: "/admin/health",
      color: stats.incidents ? "#D65D4A" : "#68A56B",
    },
  ] as const;

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border-2 border-[var(--ok-ink)] bg-[var(--ok-card)] p-6 sm:p-8">
        <p className="text-sm font-bold text-[var(--ok-accent-text)]">
          مرحبًا {profile?.display_name || "بك"}
        </p>
        <h2 className="mt-2 max-w-3xl font-display text-3xl font-bold leading-tight sm:text-4xl">
          كل ما يحتاجه الفريق في مكان واضح واحد.
        </h2>
        <p className="mt-4 max-w-2xl leading-7 opacity-70">
          تابع التنفيذ، وزّع العمل، وانظر إلى حالة الموقع والمحتوى بدون مصطلحات معقدة.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, to, color }) => (
          <Link
            key={label}
            to={to}
            className="group rounded-3xl border-2 border-[var(--ok-ink)] bg-[var(--ok-card)] p-5 transition-transform hover:-translate-y-1"
          >
            <span
              className="grid size-11 place-items-center rounded-2xl border-2 border-[var(--ok-ink)] text-[#181511]"
              style={{ backgroundColor: color }}
            >
              <Icon size={20} />
            </span>
            <p className="mt-6 text-sm font-semibold opacity-65">{label}</p>
            <div className="mt-1 flex items-end justify-between">
              <strong className="font-display text-4xl">{loading ? "—" : value}</strong>
              <ArrowUpLeft
                size={19}
                className="transition-transform group-hover:-translate-x-1 group-hover:translate-y-1"
              />
            </div>
          </Link>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-3xl border-2 border-[var(--ok-ink)] bg-[var(--ok-card)] p-6">
          <h3 className="font-display text-2xl font-bold">ترتيب التنفيذ اليومي</h3>
          <p className="mt-2 text-sm leading-6 opacity-65">
            عند وجود أكثر من مهمة في اليوم نفسه، تظهر مهام السوبر أدمن أولًا، ثم الأدمن، ثم التيم
            ليدر. لا تُحذف أي مهمة.
          </p>
          <ol className="mt-5 space-y-3">
            {["سوبر أدمن", "أدمن", "تيم ليدر"].map((role, index) => (
              <li
                key={role}
                className="flex items-center gap-3 rounded-2xl bg-[var(--ok-paper)] p-3"
              >
                <span className="grid size-8 place-items-center rounded-full bg-[#E8A33D] font-bold text-[#181511]">
                  {index + 1}
                </span>
                <span className="font-bold">{role}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="rounded-3xl border-2 border-[var(--ok-ink)] bg-[#181511] p-6 text-white">
          <Activity className="text-[#E8A33D]" size={30} />
          <h3 className="mt-5 font-display text-2xl font-bold">الفحص يشرح المشكلة</h3>
          <p className="mt-3 text-sm leading-7 text-white/65">
            بدل رسالة خطأ مبهمة، ستجد التأثير والسبب المتوقع والخطوة التالية بالعربية.
          </p>
          {profile && ["super_admin", "admin"].includes(profile.role) && (
            <Link
              to="/admin/health"
              className="mt-6 inline-flex rounded-full bg-[#E8A33D] px-5 py-2.5 font-bold text-[#181511]"
            >
              افتح حالة النظام
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}

function AdminDashboardRoute() {
  return (
    <AdminLayout title="نظرة عامة">
      <DashboardContent />
    </AdminLayout>
  );
}
