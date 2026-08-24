import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/mawid/app-shell";
import { EmptyState } from "@/components/mawid/empty-state";
import { ErrorState } from "@/components/mawid/error-state";
import { LetterAvatar } from "@/components/mawid/letter-avatar";
import { MonoText } from "@/components/mawid/mono-text";
import { StatusBadge } from "@/components/mawid/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/lib/session";
import { fetchCustomerProfile, money, saveCustomerNotes } from "@/lib/directory";

export const Route = createFileRoute("/_authenticated/app/customers/$id")({
  head: () => ({
    meta: [
      { title: "ملف العميل — مَوعِد" },
      { name: "description", content: "سجل زيارات العميل ومؤشراته وملاحظات فريق الاستقبال." },
      { property: "og:title", content: "ملف العميل — مَوعِد" },
      {
        property: "og:description",
        content: "سجل زيارات العميل ومؤشراته وملاحظات فريق الاستقبال.",
      },
    ],
  }),
  component: CustomerProfilePage,
});

function CustomerProfilePage() {
  const { id } = Route.useParams();
  const { session, role, tenantId, loading } = useSession();
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState("");

  const query = useQuery({
    queryKey: ["customer", tenantId, id],
    queryFn: () => fetchCustomerProfile(tenantId as string, id),
    enabled: Boolean(tenantId),
  });

  useEffect(() => {
    if (query.data) setNotes(query.data.notes);
  }, [query.data]);

  const save = useMutation({
    mutationFn: () => saveCustomerNotes(id, notes),
    onSuccess: () => {
      toast.success("حُفظت الملاحظات");
      void queryClient.invalidateQueries({ queryKey: ["customer", tenantId, id] });
    },
    onError: () => toast.error("تعذّر حفظ الملاحظات"),
  });

  const userName =
    (session?.user.user_metadata as { full_name?: string } | undefined)?.full_name ||
    session?.user.email ||
    "مستخدم";

  return (
    <AppShell title="ملف العميل" role={role} userName={userName} tenantName="مَوعِد">
      <div className="space-y-6">
        <Link
          to="/app/customers"
          className="inline-flex items-center gap-2 text-body-sm text-[var(--accent-700)] hover:underline"
        >
          <ArrowRight className="size-4" strokeWidth={1.5} aria-hidden />
          رجوع إلى العملاء
        </Link>

        {loading || query.isPending ? (
          <Skeleton className="h-[420px] rounded-[6px]" />
        ) : query.isError ? (
          <ErrorState
            title="تعذّر تحميل ملف العميل"
            message="ربما لا ينتمي هذا العميل إلى منشأتك. أعد المحاولة."
            onRetry={() => void query.refetch()}
          />
        ) : (
          <>
            <section className="flex flex-wrap items-center gap-4 rounded-[6px] border border-[var(--border-subtle)] bg-[var(--bg-base)] p-4">
              <LetterAvatar name={query.data.fullName} />
              <div className="min-w-0">
                <p className="text-h2 font-semibold text-[var(--text-primary)]">
                  {query.data.fullName}
                </p>
                <MonoText className="block text-body-sm text-[var(--text-secondary)]">
                  {query.data.phone}
                </MonoText>
                {query.data.email ? (
                  <MonoText className="block text-caption text-[var(--text-muted)]">
                    {query.data.email}
                  </MonoText>
                ) : null}
              </div>
            </section>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "إجمالي الزيارات", value: String(query.data.totalVisits) },
                { label: "زيارات مكتملة", value: String(query.data.completedVisits) },
                { label: "لم يحضر", value: String(query.data.noShowVisits) },
                { label: "إجمالي المدفوع", value: money(query.data.spentCents) },
              ].map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-[6px] border border-[var(--border-subtle)] bg-[var(--bg-base)] p-4"
                >
                  <p className="text-body-sm text-[var(--text-secondary)]">{metric.label}</p>
                  <p className="mt-2 text-h1 font-semibold text-[var(--text-primary)]">
                    <MonoText>{metric.value}</MonoText>
                  </p>
                </div>
              ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
              <section className="rounded-[6px] border border-[var(--border-subtle)] bg-[var(--bg-base)]">
                <h2 className="border-b border-[var(--border-subtle)] px-4 py-3 text-h3 font-semibold text-[var(--text-primary)]">
                  سجل الزيارات
                </h2>
                {query.data.visits.length === 0 ? (
                  <div className="p-6">
                    <EmptyState title="لا زيارات بعد" hint="ستظهر الزيارات هنا بعد أول موعد." />
                  </div>
                ) : (
                  <ol className="divide-y divide-[var(--border-subtle)]">
                    {query.data.visits.map((visit) => (
                      <li key={visit.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-body font-medium text-[var(--text-primary)]">
                            {visit.serviceName}
                          </p>
                          <p className="truncate text-body-sm text-[var(--text-secondary)]">
                            {visit.staffName}
                          </p>
                        </div>
                        <div className="text-left">
                          <MonoText className="block text-body-sm text-[var(--text-primary)]">
                            {visit.dateLabel}
                          </MonoText>
                          <MonoText className="block text-caption text-[var(--text-muted)]">
                            {visit.timeLabel}
                          </MonoText>
                        </div>
                        <MonoText className="text-body-sm text-[var(--text-primary)]">
                          {money(visit.priceCents)}
                        </MonoText>
                        <StatusBadge status={visit.status} />
                      </li>
                    ))}
                  </ol>
                )}
              </section>

              <section className="rounded-[6px] border border-[var(--border-subtle)] bg-[var(--bg-base)] p-4">
                <h2 className="text-h3 font-semibold text-[var(--text-primary)]">ملاحظات</h2>
                <p className="mt-1 text-caption text-[var(--text-muted)]">تظهر لفريق المنشأة فقط</p>
                <Textarea
                  aria-label="ملاحظات عن العميل"
                  className="mt-3 min-h-[140px]"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                />
                <Button
                  className="mt-3 w-full"
                  loading={save.isPending}
                  onClick={() => save.mutate()}
                >
                  حفظ الملاحظات
                </Button>
                {query.data.lastVisitLabel ? (
                  <p className="mt-4 text-body-sm text-[var(--text-secondary)]">
                    آخر زيارة: <MonoText>{query.data.lastVisitLabel}</MonoText>
                  </p>
                ) : null}
              </section>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
