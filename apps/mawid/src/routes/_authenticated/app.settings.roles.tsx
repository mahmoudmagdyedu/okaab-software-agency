import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck, Trash2, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/mawid/app-shell";
import { EmptyState } from "@/components/mawid/empty-state";
import { ErrorState } from "@/components/mawid/error-state";
import { InlineAlert } from "@/components/mawid/inline-alert";
import { LetterAvatar } from "@/components/mawid/letter-avatar";
import { MonoText } from "@/components/mawid/mono-text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ROLE_LABELS, useSession } from "@/lib/session";
import type { AppRole } from "@/components/mawid/can";
import {
  addTenantMember,
  ASSIGNABLE_ROLES,
  fetchTenantMembers,
  removeTenantMember,
  roleErrorMessage,
  ROLE_SCOPE,
  updateMemberRole,
} from "@/lib/roles";

export const Route = createFileRoute("/_authenticated/app/settings/roles")({
  head: () => ({
    meta: [
      { title: "الأدوار والصلاحيات — مَوعِد" },
      {
        name: "description",
        content: "أدِر أدوار مستخدمي المنشأة وصلاحيات وصولهم إلى شاشات لوحة الإدارة اليومية.",
      },
      { property: "og:title", content: "الأدوار والصلاحيات — مَوعِد" },
      {
        property: "og:description",
        content: "تعيين أدوار الفريق والتحكم في وصول كل دور إلى شاشات المنشأة.",
      },
    ],
  }),
  component: RolesSettingsPage,
});

function RolesSettingsPage() {
  const { session, role, tenantId, loading } = useSession();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [newRole, setNewRole] = useState<AppRole>("receptionist");

  const canEdit = role === "owner" || role === "branch_manager" || role === "super_admin";

  const query = useQuery({
    queryKey: ["tenant-members", tenantId],
    queryFn: () => fetchTenantMembers(tenantId as string),
    enabled: Boolean(tenantId) && canEdit,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["tenant-members", tenantId] });

  const add = useMutation({
    mutationFn: () => addTenantMember(tenantId as string, email.trim(), newRole),
    onSuccess: () => {
      toast.success("أُضيف العضو بالدور المحدد");
      setEmail("");
      void refresh();
    },
    onError: (error: Error) => toast.error(roleErrorMessage(error.message)),
  });

  const change = useMutation({
    mutationFn: (vars: { userId: string; role: AppRole }) =>
      updateMemberRole(tenantId as string, vars.userId, vars.role),
    onSuccess: () => {
      toast.success("حُدِّث الدور");
      void refresh();
    },
    onError: (error: Error) => toast.error(roleErrorMessage(error.message)),
  });

  const remove = useMutation({
    mutationFn: (userId: string) => removeTenantMember(tenantId as string, userId),
    onSuccess: () => {
      toast.success("أُزيل العضو من المنشأة");
      void refresh();
    },
    onError: (error: Error) => toast.error(roleErrorMessage(error.message)),
  });

  const userName =
    (session?.user.user_metadata as { full_name?: string } | undefined)?.full_name ||
    session?.user.email ||
    "مستخدم";

  return (
    <AppShell title="الأدوار والصلاحيات" role={role} userName={userName} tenantName="مَوعِد">
      {loading ? (
        <Skeleton className="h-[420px] rounded-[6px]" />
      ) : !canEdit ? (
        <InlineAlert tone="info">
          <strong className="font-medium">لا صلاحية:</strong> إدارة الأدوار متاحة لمدير الفرع
          والمالك فقط.
        </InlineAlert>
      ) : (
        <div className="space-y-6">
          <section className="space-y-4 rounded-[6px] border border-[var(--border-subtle)] bg-[var(--bg-base)] p-4">
            <div className="flex items-center gap-2">
              <UserPlus
                className="size-[18px] text-[var(--accent-700)]"
                strokeWidth={1.5}
                aria-hidden
              />
              <h2 className="text-h3 font-semibold text-[var(--text-primary)]">إضافة عضو</h2>
            </div>
            <p className="text-body-sm text-[var(--text-secondary)]">
              أدخل بريد مستخدم مسجَّل في المنصة ليُمنح دورًا داخل هذه المنشأة.
            </p>
            <div className="grid gap-4 md:grid-cols-[1fr_220px_auto] md:items-end">
              <div className="space-y-2">
                <Label htmlFor="member-email">البريد الإلكتروني</Label>
                <Input
                  id="member-email"
                  type="email"
                  dir="ltr"
                  className="font-mono"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="member-role">الدور</Label>
                <select
                  id="member-role"
                  value={newRole}
                  onChange={(event) => setNewRole(event.target.value as AppRole)}
                  className="h-10 w-full rounded-[6px] border border-[var(--border-subtle)] bg-[var(--bg-base)] px-3 text-body-sm text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-600)]"
                >
                  {ASSIGNABLE_ROLES.map((item) => (
                    <option key={item} value={item}>
                      {ROLE_LABELS[item]}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                onClick={() => add.mutate()}
                loading={add.isPending}
                disabled={!email.trim() || add.isPending}
              >
                إضافة
              </Button>
            </div>
          </section>

          <section className="rounded-[6px] border border-[var(--border-subtle)] bg-[var(--bg-base)]">
            <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] p-4">
              <ShieldCheck
                className="size-[18px] text-[var(--accent-700)]"
                strokeWidth={1.5}
                aria-hidden
              />
              <h2 className="text-h3 font-semibold text-[var(--text-primary)]">أعضاء المنشأة</h2>
            </div>

            {query.isPending ? (
              <div className="space-y-3 p-4">
                <Skeleton className="h-14 rounded-[6px]" />
                <Skeleton className="h-14 rounded-[6px]" />
                <Skeleton className="h-14 rounded-[6px]" />
              </div>
            ) : query.isError ? (
              <div className="p-4">
                <ErrorState
                  title="تعذّر تحميل الأعضاء"
                  message="حدث خلل أثناء جلب قائمة الأعضاء. أعد المحاولة."
                  onRetry={() => void query.refetch()}
                />
              </div>
            ) : (query.data ?? []).length === 0 ? (
              <div className="p-4">
                <EmptyState title="لا أعضاء بعد" hint="أضف أول عضو للفريق عبر بريده الإلكتروني." />
              </div>
            ) : (
              <ul className="divide-y divide-[var(--border-subtle)]">
                {(query.data ?? []).map((member) => {
                  const isSelf = member.userId === session?.user.id;
                  return (
                    <li key={member.userId} className="flex flex-wrap items-center gap-4 p-4">
                      <LetterAvatar name={member.fullName || member.email} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-body-sm font-medium text-[var(--text-primary)]">
                          {member.fullName || "بلا اسم"}
                          {isSelf ? (
                            <span className="mr-2 text-caption text-[var(--text-muted)]">
                              (أنت)
                            </span>
                          ) : null}
                        </p>
                        <MonoText className="block truncate text-caption text-[var(--text-muted)]">
                          {member.email}
                        </MonoText>
                      </div>

                      <select
                        aria-label={`دور ${member.fullName || member.email}`}
                        value={member.role}
                        disabled={isSelf || member.role === "super_admin" || change.isPending}
                        onChange={(event) =>
                          change.mutate({
                            userId: member.userId,
                            role: event.target.value as AppRole,
                          })
                        }
                        className="h-10 w-[180px] rounded-[6px] border border-[var(--border-subtle)] bg-[var(--bg-base)] px-3 text-body-sm text-[var(--text-primary)] disabled:cursor-not-allowed disabled:text-[var(--text-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-600)]"
                      >
                        {member.role === "super_admin" || member.role === "customer" ? (
                          <option value={member.role}>{ROLE_LABELS[member.role]}</option>
                        ) : null}
                        {ASSIGNABLE_ROLES.map((item) => (
                          <option key={item} value={item}>
                            {ROLE_LABELS[item]}
                          </option>
                        ))}
                      </select>

                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="إزالة العضو"
                        disabled={isSelf || remove.isPending}
                        onClick={() => remove.mutate(member.userId)}
                      >
                        <Trash2
                          className="size-[18px] text-[var(--text-muted)]"
                          strokeWidth={1.5}
                          aria-hidden
                        />
                      </Button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="space-y-3 rounded-[6px] border border-[var(--border-subtle)] bg-[var(--bg-base)] p-4">
            <h2 className="text-h3 font-semibold text-[var(--text-primary)]">
              ماذا يستطيع كل دور؟
            </h2>
            <ul className="space-y-2">
              {(["receptionist", "provider", "branch_manager", "owner"] as AppRole[]).map(
                (item) => (
                  <li
                    key={item}
                    className="rounded-[6px] border border-[var(--border-subtle)] bg-[var(--bg-subtle)] p-3"
                  >
                    <p className="text-body-sm font-medium text-[var(--text-primary)]">
                      {ROLE_LABELS[item]}
                    </p>
                    <p className="text-caption text-[var(--text-secondary)]">{ROLE_SCOPE[item]}</p>
                  </li>
                ),
              )}
            </ul>
            <InlineAlert tone="info">
              الوصول إلى <MonoText>/app/*</MonoText> مفروض في قاعدة البيانات عبر سياسات الأمان،
              وإخفاء عناصر القائمة تبعًا للدور طبقة إضافية فقط.
            </InlineAlert>
          </section>
        </div>
      )}
    </AppShell>
  );
}
