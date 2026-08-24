import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useState } from "react";

import { AppShell } from "@/components/mawid/app-shell";
import { EmptyState } from "@/components/mawid/empty-state";
import { ErrorState } from "@/components/mawid/error-state";
import { LetterAvatar } from "@/components/mawid/letter-avatar";
import { MonoText } from "@/components/mawid/mono-text";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/lib/session";
import { fetchCustomers } from "@/lib/directory";

export const Route = createFileRoute("/_authenticated/app/customers/")({
  head: () => ({
    meta: [
      { title: "العملاء — مَوعِد" },
      { name: "description", content: "قائمة عملاء منشأتك مع أرقام التواصل وعدد الزيارات." },
      { property: "og:title", content: "العملاء — مَوعِد" },
      {
        property: "og:description",
        content: "قائمة عملاء منشأتك مع أرقام التواصل وعدد الزيارات.",
      },
    ],
  }),
  component: CustomersPage,
});

function CustomersPage() {
  const { session, role, tenantId, loading } = useSession();
  const [search, setSearch] = useState("");

  const query = useQuery({
    queryKey: ["customers", tenantId, search],
    queryFn: () => fetchCustomers(tenantId as string, search),
    enabled: Boolean(tenantId),
  });

  const userName =
    (session?.user.user_metadata as { full_name?: string } | undefined)?.full_name ||
    session?.user.email ||
    "مستخدم";

  return (
    <AppShell title="العملاء" role={role} userName={userName} tenantName="مَوعِد">
      <div className="space-y-4">
        <div className="relative w-full max-w-[320px]">
          <Search
            className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[var(--text-muted)]"
            strokeWidth={1.5}
            aria-hidden
          />
          <Input
            aria-label="بحث بالاسم أو الجوال"
            placeholder="ابحث بالاسم أو الجوال"
            className="pr-9"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {loading || query.isPending ? (
          <Skeleton className="h-[400px] rounded-[6px]" />
        ) : query.isError ? (
          <ErrorState
            title="تعذّر تحميل العملاء"
            message="حدث خلل أثناء جلب القائمة. أعد المحاولة."
            onRetry={() => void query.refetch()}
          />
        ) : query.data.length === 0 ? (
          <div className="rounded-[6px] border border-[var(--border-subtle)] bg-[var(--bg-base)] p-8">
            <EmptyState title="لا عملاء مطابقون" hint="جرّب كلمة بحث أخرى أو أضف موعدًا جديدًا." />
          </div>
        ) : (
          <ul className="divide-y divide-[var(--border-subtle)] rounded-[6px] border border-[var(--border-subtle)] bg-[var(--bg-base)]">
            {query.data.map((customer) => (
              <li key={customer.id}>
                <Link
                  to="/app/customers/$id"
                  params={{ id: customer.id }}
                  className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-[var(--bg-subtle)] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--accent-600)]"
                >
                  <LetterAvatar name={customer.fullName} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-body font-medium text-[var(--text-primary)]">
                      {customer.fullName}
                    </p>
                    <MonoText className="block text-caption text-[var(--text-muted)]">
                      {customer.phone}
                    </MonoText>
                  </div>
                  <p className="text-body-sm text-[var(--text-secondary)]">
                    <MonoText>{String(customer.visits)}</MonoText> زيارة
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
