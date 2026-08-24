import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Search } from "lucide-react";
import { useState } from "react";

import { AppShell } from "@/components/mawid/app-shell";
import { EmptyState } from "@/components/mawid/empty-state";
import { ErrorState } from "@/components/mawid/error-state";
import { MonoText } from "@/components/mawid/mono-text";
import { StatusBadge, type AppointmentStatus } from "@/components/mawid/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/lib/session";
import { fetchAppointments, money, PAGE_SIZE, type AppointmentsQuery } from "@/lib/directory";

export const Route = createFileRoute("/_authenticated/app/appointments")({
  head: () => ({
    meta: [
      { title: "سجل المواعيد — مَوعِد" },
      {
        name: "description",
        content: "ابحث في مواعيد منشأتك وافرزها حسب الحالة والتاريخ والمبلغ.",
      },
      { property: "og:title", content: "سجل المواعيد — مَوعِد" },
      {
        property: "og:description",
        content: "ابحث في مواعيد منشأتك وافرزها حسب الحالة والتاريخ والمبلغ.",
      },
    ],
  }),
  component: AppointmentsPage,
});

const FILTERS: { value: AppointmentStatus | "all"; label: string }[] = [
  { value: "all", label: "الكل" },
  { value: "confirmed", label: "مؤكد" },
  { value: "pending_deposit", label: "بانتظار العربون" },
  { value: "completed", label: "مكتمل" },
  { value: "cancelled", label: "ملغي" },
  { value: "no_show", label: "لم يحضر" },
];

function AppointmentsPage() {
  const { session, role, tenantId, loading } = useSession();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<AppointmentStatus | "all">("all");
  const [sort, setSort] = useState<AppointmentsQuery["sort"]>("starts_at");
  const [direction, setDirection] = useState<AppointmentsQuery["direction"]>("desc");
  const [page, setPage] = useState(0);

  const query = useQuery({
    queryKey: ["appointments", tenantId, search, status, sort, direction, page],
    queryFn: () =>
      fetchAppointments({ tenantId: tenantId as string, search, status, sort, direction, page }),
    enabled: Boolean(tenantId),
  });

  const userName =
    (session?.user.user_metadata as { full_name?: string } | undefined)?.full_name ||
    session?.user.email ||
    "مستخدم";

  const toggleSort = (next: AppointmentsQuery["sort"]) => {
    setPage(0);
    if (sort === next) {
      setDirection(direction === "asc" ? "desc" : "asc");
      return;
    }
    setSort(next);
    setDirection("desc");
  };

  const SortIcon = direction === "asc" ? ArrowUp : ArrowDown;
  const total = query.data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <AppShell title="المواعيد" role={role} userName={userName} tenantName="مَوعِد">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full max-w-[280px]">
            <Search
              className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[var(--text-muted)]"
              strokeWidth={1.5}
              aria-hidden
            />
            <Input
              aria-label="بحث برقم الحجز"
              placeholder="ابحث برقم الحجز"
              className="pr-9"
              value={search}
              onChange={(event) => {
                setPage(0);
                setSearch(event.target.value);
              }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => {
                  setPage(0);
                  setStatus(filter.value);
                }}
                className={`min-h-8 rounded-[6px] border px-3 text-body-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-600)] ${
                  status === filter.value
                    ? "border-[var(--accent-600)] bg-[var(--accent-50)] text-[var(--accent-700)]"
                    : "border-[var(--border-subtle)] bg-[var(--bg-base)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {loading || query.isPending ? (
          <Skeleton className="h-[420px] rounded-[6px]" />
        ) : query.isError ? (
          <ErrorState
            title="تعذّر تحميل المواعيد"
            message="حدث خلل أثناء جلب السجل. أعد المحاولة."
            onRetry={() => void query.refetch()}
          />
        ) : query.data.rows.length === 0 ? (
          <div className="rounded-[6px] border border-[var(--border-subtle)] bg-[var(--bg-base)] p-8">
            <EmptyState title="لا مواعيد مطابقة" hint="جرّب تغيير الحالة أو مسح كلمة البحث." />
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[6px] border border-[var(--border-subtle)] bg-[var(--bg-base)]">
            <table className="w-full min-w-[840px] text-right">
              <thead className="bg-[var(--bg-subtle)] text-body-sm text-[var(--text-secondary)]">
                <tr>
                  <th className="px-4 py-3 font-medium">رقم الحجز</th>
                  <th className="px-4 py-3 font-medium">العميل</th>
                  <th className="px-4 py-3 font-medium">الخدمة</th>
                  <th className="px-4 py-3 font-medium">مقدم الخدمة</th>
                  <th className="px-4 py-3 font-medium">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1"
                      onClick={() => toggleSort("starts_at")}
                    >
                      التاريخ والوقت
                      {sort === "starts_at" ? <SortIcon className="size-3.5" aria-hidden /> : null}
                    </button>
                  </th>
                  <th className="px-4 py-3 font-medium">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1"
                      onClick={() => toggleSort("price_cents")}
                    >
                      المبلغ
                      {sort === "price_cents" ? (
                        <SortIcon className="size-3.5" aria-hidden />
                      ) : null}
                    </button>
                  </th>
                  <th className="px-4 py-3 font-medium">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {query.data.rows.map((row) => (
                  <tr key={row.id} className="hover:bg-[var(--bg-subtle)]">
                    <td className="px-4 py-3">
                      <MonoText className="text-body-sm text-[var(--text-secondary)]">
                        {row.bookingRef}
                      </MonoText>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to="/app/customers/$id"
                        params={{ id: row.customerId }}
                        className="text-body-sm font-medium text-[var(--accent-700)] hover:underline"
                      >
                        {row.customerName}
                      </Link>
                      <MonoText className="block text-caption text-[var(--text-muted)]">
                        {row.customerPhone}
                      </MonoText>
                    </td>
                    <td className="px-4 py-3 text-body-sm text-[var(--text-primary)]">
                      {row.serviceName}
                    </td>
                    <td className="px-4 py-3 text-body-sm text-[var(--text-secondary)]">
                      {row.staffName}
                    </td>
                    <td className="px-4 py-3">
                      <MonoText className="block text-body-sm text-[var(--text-primary)]">
                        {row.dateLabel}
                      </MonoText>
                      <MonoText className="block text-caption text-[var(--text-muted)]">
                        {row.timeLabel}
                      </MonoText>
                    </td>
                    <td className="px-4 py-3">
                      <MonoText className="text-body-sm text-[var(--text-primary)]">
                        {money(row.priceCents)}
                      </MonoText>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={row.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {total > PAGE_SIZE ? (
          <div className="flex items-center justify-between gap-3">
            <p className="text-body-sm text-[var(--text-secondary)]">
              صفحة <MonoText>{`${page + 1}/${pages}`}</MonoText> — <MonoText>{total}</MonoText> موعد
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                السابق
              </Button>
              <Button
                variant="secondary"
                disabled={page + 1 >= pages}
                onClick={() => setPage((p) => p + 1)}
              >
                التالي
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
