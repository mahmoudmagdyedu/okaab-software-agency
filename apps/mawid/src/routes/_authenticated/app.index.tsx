import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarClock, CircleDollarSign, Percent, UserX } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect } from "react";

import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/mawid/app-shell";
import { EmptyState } from "@/components/mawid/empty-state";
import { ErrorState } from "@/components/mawid/error-state";
import { LetterAvatar } from "@/components/mawid/letter-avatar";
import { MonoText } from "@/components/mawid/mono-text";
import { StatusBadge } from "@/components/mawid/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/lib/session";
import { fetchToday, type TodayBoard } from "@/lib/today";

export const Route = createFileRoute("/_authenticated/app/")({
  head: () => ({
    meta: [
      { title: "لوحة اليوم — مَوعِد" },
      { name: "description", content: "مواعيد اليوم والإيراد المتوقع ونسبة الإشغال في منشأتك." },
      { property: "og:title", content: "لوحة اليوم — مَوعِد" },
      {
        property: "og:description",
        content: "مواعيد اليوم والإيراد المتوقع ونسبة الإشغال في منشأتك.",
      },
    ],
  }),
  component: TodayPage,
});

function TodayPage() {
  const { session, role, tenantId, loading } = useSession();

  // أول مستخدم يدخل ينضم إلى العيادة التجريبية ليرى بياناتها.
  useEffect(() => {
    if (loading || !session || tenantId) return;
    void supabase.rpc("claim_demo_membership", { _role: "owner" }).then(() => {
      window.location.reload();
    });
  }, [loading, session, tenantId]);

  const query = useQuery({
    queryKey: ["today", tenantId],
    queryFn: () => fetchToday(tenantId as string),
    enabled: Boolean(tenantId),
  });

  const userName =
    (session?.user.user_metadata as { full_name?: string } | undefined)?.full_name ||
    session?.user.email ||
    "مستخدم";

  return (
    <AppShell
      title="لوحة اليوم"
      role={role}
      userName={userName}
      tenantName={query.data?.tenantName ?? "…"}
    >
      {query.isPending || loading ? (
        <TodaySkeleton />
      ) : query.isError ? (
        <ErrorState
          title="تعذّر تحميل بيانات اليوم"
          message="حدث خلل أثناء جلب المواعيد. تأكد من الاتصال ثم أعد المحاولة."
          onRetry={() => void query.refetch()}
        />
      ) : (
        <TodayContent board={query.data} />
      )}
    </AppShell>
  );
}

function TodayContent({ board }: { board: TodayBoard }) {
  const stats: {
    label: string;
    value: string;
    icon: LucideIcon;
    surface: string;
    text: string;
    soft: string;
  }[] = [
    {
      label: "إيراد اليوم",
      value: `${(board.expectedRevenueCents / 100).toLocaleString("en-US")} ج.م`,
      icon: CircleDollarSign,
      surface: "bg-background",
      text: "text-ink",
      soft: "text-ink-soft",
    },
    {
      label: "نسبة الإشغال",
      value: `${board.occupancyPercent}%`,
      icon: Percent,
      surface: "bg-tint-teal",
      text: "text-on-dark",
      soft: "text-on-dark-soft",
    },
    {
      label: "لم يحضر",
      value: String(board.noShow),
      icon: UserX,
      surface: "bg-tint-amber",
      text: "text-ink",
      soft: "text-ink-soft",
    },
    {
      label: "مواعيد اليوم",
      value: String(board.total),
      icon: CalendarClock,
      surface: "bg-accent-600",
      text: "text-on-dark",
      soft: "text-on-dark-soft",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-body-sm text-ink-soft">
          <MonoText>{board.todayLabel}</MonoText> — {board.branchName}
        </p>
        <Button asChild>
          <Link to="/app/calendar">موعد جديد</Link>
        </Button>
      </div>

      <div className="grid gap-0 border border-border sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`${stat.surface} border-border p-5 sm:border-s-2 sm:first:border-s-0`}
          >
            <div className={`flex items-center gap-2 ${stat.soft}`}>
              <stat.icon className="size-4" strokeWidth={1.5} aria-hidden />
              <span className="text-caption">{stat.label}</span>
            </div>
            <p className={`mt-4 text-display font-bold ${stat.text}`}>
              <MonoText>{stat.value}</MonoText>
            </p>
          </div>
        ))}
      </div>

      <section className="border border-border bg-background">
        <h2 className="border-b border-border px-5 py-4 text-h3 font-bold text-ink">
          المواعيد القادمة
        </h2>
        {board.appointments.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="لا مواعيد اليوم"
              hint="أضف أول موعد ليظهر هنا مع تفاصيل العميل والخدمة."
              actionLabel="موعد جديد"
            />
          </div>
        ) : (
          <ul className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
            {board.appointments.map((appt, index) => (
              <li key={appt.id} className="relative border border-border bg-background p-4 pt-5">
                <span
                  aria-hidden
                  className={`absolute inset-x-0 top-0 h-[6px] ${
                    ["bg-tint-green", "bg-tint-amber", "bg-tint-teal", "bg-tint-pink"][index % 4]
                  }`}
                />
                <div className="flex items-center justify-between gap-2">
                  <MonoText className="text-body-sm font-bold text-ink">{appt.timeLabel}</MonoText>
                  <StatusBadge status={appt.status} />
                </div>
                <p className="mt-2 flex items-center gap-2 truncate text-body font-semibold text-ink">
                  <LetterAvatar name={appt.customerName} size="sm" />
                  <span className="truncate">{appt.customerName}</span>
                </p>
                <p className="mt-1 truncate text-caption text-ink-soft">
                  {appt.serviceName} — {appt.staffName}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function TodaySkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-48" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[108px] rounded-[6px]" />
        ))}
      </div>
      <Skeleton className="h-[320px] rounded-[6px]" />
    </div>
  );
}
