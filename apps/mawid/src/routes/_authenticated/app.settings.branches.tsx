import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, CalendarOff, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/mawid/app-shell";
import { EmptyState } from "@/components/mawid/empty-state";
import { ErrorState } from "@/components/mawid/error-state";
import { InlineAlert } from "@/components/mawid/inline-alert";
import { MonoText } from "@/components/mawid/mono-text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  addBranchClosure,
  branchErrorMessage,
  BRANCH_TIMEZONES,
  fetchBranchClosures,
  fetchBranches,
  removeBranchClosure,
  updateBranch,
  type BranchRecord,
} from "@/lib/branches";
import { useSession } from "@/lib/session";

export const Route = createFileRoute("/_authenticated/app/settings/branches")({
  head: () => ({
    meta: [
      { title: "إعدادات الفروع — مَوعِد" },
      {
        name: "description",
        content:
          "أدِر اسم الفرع وعنوانه ومنطقته الزمنية وسياسة الإلغاء والعربون وإجازات الفرع المرتبطة بصفحة الحجز.",
      },
      { property: "og:title", content: "إعدادات الفروع — مَوعِد" },
      {
        property: "og:description",
        content: "بيانات الفرع، المنطقة الزمنية، وإجازات الفرع التي تُخفي فتحات الحجز تلقائيًا.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BranchesSettingsPage,
});

function BranchesSettingsPage() {
  const { session, role, tenantId, loading } = useSession();
  const queryClient = useQueryClient();
  const canEdit = role === "owner" || role === "branch_manager" || role === "super_admin";
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["branches", tenantId],
    queryFn: () => fetchBranches(tenantId as string),
    enabled: Boolean(tenantId) && canEdit,
  });

  const branches = query.data ?? [];
  useEffect(() => {
    if (!selectedId && branches.length > 0) setSelectedId(branches[0]!.id);
  }, [branches, selectedId]);
  const selected = branches.find((b) => b.id === selectedId) ?? null;

  const shellProps = {
    title: "إعدادات الفروع",
    role,
    userName: session?.user.email ?? "",
    tenantName: "مَوعِد",
  };

  if (loading) {
    return (
      <AppShell {...shellProps}>
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AppShell>
    );
  }

  if (!canEdit) {
    return (
      <AppShell {...shellProps}>
        <InlineAlert tone="warning" title="صلاحية غير كافية">
          إعدادات الفروع متاحة لمدير الفرع والمالك فقط.
        </InlineAlert>
      </AppShell>
    );
  }

  return (
    <AppShell {...shellProps}>
      <div className="space-y-6">
        <InlineAlert tone="info" title="مرتبطة بصفحة الحجز">
          الاسم والعنوان والمنطقة الزمنية تظهر للعميل في صفحة الحجز العامة، وإجازات الفرع تُخفي كل
          الفتحات المتاحة في مدتها تلقائيًا. التخزين بتوقيت UTC والعرض بتوقيت الفرع.
        </InlineAlert>

        {query.isPending ? (
          <Skeleton className="h-64 w-full" />
        ) : query.isError ? (
          <ErrorState
            title="تعذّر تحميل الفروع"
            message="حدث خطأ أثناء جلب بيانات الفروع."
            onRetry={() => void query.refetch()}
          />
        ) : branches.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="لا فروع بعد"
            hint="أضف فرعًا لتبدأ استقبال الحجوزات."
          />
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {branches.map((branch) => (
                <button
                  key={branch.id}
                  type="button"
                  onClick={() => setSelectedId(branch.id)}
                  className={
                    branch.id === selectedId
                      ? "rounded-lg border border-accent-600 bg-accent-50 px-4 py-2 text-sm font-medium text-accent-700"
                      : "rounded-lg border border-subtle bg-base px-4 py-2 text-sm text-secondary hover:bg-subtle"
                  }
                >
                  {branch.name}
                </button>
              ))}
            </div>

            {selected ? (
              <div className="grid gap-6 lg:grid-cols-2">
                <BranchForm
                  branch={selected}
                  onSaved={() =>
                    void queryClient.invalidateQueries({ queryKey: ["branches", tenantId] })
                  }
                />
                <ClosuresCard tenantId={tenantId as string} branch={selected} />
              </div>
            ) : null}
          </>
        )}
      </div>
    </AppShell>
  );
}

function BranchForm({ branch, onSaved }: { branch: BranchRecord; onSaved: () => void }) {
  const [form, setForm] = useState(branch);
  useEffect(() => setForm(branch), [branch]);

  const save = useMutation({
    mutationFn: () =>
      updateBranch(branch.id, {
        name: form.name.trim(),
        address: form.address.trim(),
        phone: form.phone.trim(),
        timezone: form.timezone,
        freeCancellationHours: form.freeCancellationHours,
        depositPercent: form.depositPercent,
        isActive: form.isActive,
      }),
    onSuccess: () => {
      toast.success("حُفِظت بيانات الفرع");
      onSaved();
    },
    onError: (error: Error) => toast.error(branchErrorMessage(error.message)),
  });

  const invalid =
    form.name.trim().length < 2 ||
    form.freeCancellationHours < 0 ||
    form.depositPercent < 0 ||
    form.depositPercent > 100;

  return (
    <section className="rounded-xl border border-subtle bg-base p-6">
      <h2 className="mb-6 flex items-center gap-2 text-base font-semibold text-primary">
        <Building2 className="size-4 text-accent-600" aria-hidden />
        بيانات الفرع
      </h2>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="branch-name">اسم الفرع</Label>
          <Input
            id="branch-name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="branch-address">العنوان</Label>
          <Input
            id="branch-address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="branch-phone">هاتف الفرع</Label>
          <Input
            id="branch-phone"
            className="mono-ltr"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+966500000000"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="branch-tz">المنطقة الزمنية</Label>
          <select
            id="branch-tz"
            value={form.timezone}
            onChange={(e) => setForm({ ...form, timezone: e.target.value })}
            className="h-10 w-full rounded-lg border border-subtle bg-base px-3 text-sm text-primary"
          >
            {BRANCH_TIMEZONES.some((t) => t.value === form.timezone) ? null : (
              <option value={form.timezone}>{form.timezone}</option>
            )}
            {BRANCH_TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="branch-cancel">إلغاء مجاني قبل (ساعة)</Label>
            <Input
              id="branch-cancel"
              type="number"
              min={0}
              max={168}
              className="mono-ltr"
              value={form.freeCancellationHours}
              onChange={(e) =>
                setForm({ ...form, freeCancellationHours: Number(e.target.value) || 0 })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="branch-deposit">نسبة العربون (%)</Label>
            <Input
              id="branch-deposit"
              type="number"
              min={0}
              max={100}
              className="mono-ltr"
              value={form.depositPercent}
              onChange={(e) => setForm({ ...form, depositPercent: Number(e.target.value) || 0 })}
            />
          </div>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-subtle bg-subtle px-4 py-3">
          <div>
            <p className="text-sm font-medium text-primary">الفرع مفعَّل</p>
            <p className="text-xs text-secondary">
              عند الإيقاف يختفي الفرع وخدماته من صفحة الحجز العامة.
            </p>
          </div>
          <Switch
            checked={form.isActive}
            onCheckedChange={(v) => setForm({ ...form, isActive: v })}
            aria-label="تفعيل الفرع"
          />
        </div>
        <Button
          onClick={() => save.mutate()}
          loading={save.isPending}
          disabled={invalid}
          className="w-full"
        >
          حفظ بيانات الفرع
        </Button>
      </div>
    </section>
  );
}

function ClosuresCard({ tenantId, branch }: { tenantId: string; branch: BranchRecord }) {
  const queryClient = useQueryClient();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");

  const key = ["branch-closures", tenantId, branch.id];
  const query = useQuery({
    queryKey: key,
    queryFn: () => fetchBranchClosures(tenantId, branch.id),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: key });

  const add = useMutation({
    mutationFn: () =>
      addBranchClosure({
        tenantId,
        branchId: branch.id,
        timezone: branch.timezone,
        fromDate,
        toDate: toDate || fromDate,
        reason,
      }),
    onSuccess: () => {
      toast.success("أُضيفت إجازة الفرع");
      setFromDate("");
      setToDate("");
      setReason("");
      void refresh();
    },
    onError: (error: Error) =>
      toast.error(
        error.message === "invalid_range" ? "مدة غير صحيحة." : branchErrorMessage(error.message),
      ),
  });

  const remove = useMutation({
    mutationFn: (id: string) => removeBranchClosure(id),
    onSuccess: () => {
      toast.success("أُزيلت الإجازة");
      void refresh();
    },
    onError: (error: Error) => toast.error(branchErrorMessage(error.message)),
  });

  const fmt = (iso: string) =>
    new Intl.DateTimeFormat("ar", {
      dateStyle: "medium",
      timeZone: branch.timezone,
    }).format(new Date(iso));

  return (
    <section className="rounded-xl border border-subtle bg-base p-6">
      <h2 className="mb-2 flex items-center gap-2 text-base font-semibold text-primary">
        <CalendarOff className="size-4 text-accent-600" aria-hidden />
        إجازات الفرع
      </h2>
      <p className="mb-6 text-xs text-secondary">
        أي موعد جديد داخل هذه المدة يُمنع تلقائيًا في صفحة الحجز وفي التقويم.
      </p>

      <div className="mb-6 space-y-4 rounded-lg border border-subtle bg-subtle p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="closure-from">من تاريخ</Label>
            <Input
              id="closure-from"
              type="date"
              className="mono-ltr"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="closure-to">إلى تاريخ</Label>
            <Input
              id="closure-to"
              type="date"
              className="mono-ltr"
              value={toDate}
              min={fromDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="closure-reason">السبب</Label>
          <Input
            id="closure-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="عطلة رسمية، صيانة…"
          />
        </div>
        <Button
          onClick={() => add.mutate()}
          loading={add.isPending}
          disabled={!fromDate}
          className="w-full"
        >
          <Plus className="size-4" aria-hidden />
          إضافة إجازة
        </Button>
      </div>

      {query.isPending ? (
        <Skeleton className="h-24 w-full" />
      ) : query.isError ? (
        <ErrorState
          title="تعذّر تحميل الإجازات"
          message="حدث خطأ أثناء جلب إجازات الفرع."
          onRetry={() => void query.refetch()}
        />
      ) : (query.data ?? []).length === 0 ? (
        <EmptyState
          icon={CalendarOff}
          title="لا إجازات مسجَّلة"
          hint="الفرع يعمل بحسب جدول التوفر الأسبوعي."
        />
      ) : (
        <ul className="divide-y divide-subtle">
          {(query.data ?? []).map((closure) => (
            <li key={closure.id} className="flex items-center justify-between gap-4 py-3">
              <div>
                <p className="text-sm font-medium text-primary">{closure.reason}</p>
                <MonoText className="text-xs text-secondary">
                  {fmt(closure.startsAt)} → {fmt(closure.endsAt)}
                </MonoText>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => remove.mutate(closure.id)}
                aria-label={`إزالة ${closure.reason}`}
              >
                <Trash2 className="size-4 text-error" aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
