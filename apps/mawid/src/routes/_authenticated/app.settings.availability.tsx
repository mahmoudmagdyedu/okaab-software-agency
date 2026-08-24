import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarOff, Clock, Copy, Plus, Trash2, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
  addException,
  addWorkWindow,
  availabilityErrorMessage,
  copyDayWindows,
  fetchExceptions,
  fetchStaffOptions,
  fetchWorkWindows,
  minutesToTime,
  removeException,
  removeWorkWindow,
  timeToMinutes,
  toggleWorkWindow,
  WEEKDAYS,
  type StaffOption,
  type WorkWindow,
} from "@/lib/availability";
import { fetchBranches } from "@/lib/branches";
import { useSession } from "@/lib/session";

export const Route = createFileRoute("/_authenticated/app/settings/availability")({
  head: () => ({
    meta: [
      { title: "إدارة التوفر — مَوعِد" },
      {
        name: "description",
        content:
          "اضبط نوافذ العمل الأسبوعية لكل مقدم خدمة، وأضف الإجازات والاستثناءات المرتبطة مباشرة بفتحات الحجز.",
      },
      { property: "og:title", content: "إدارة التوفر — مَوعِد" },
      {
        property: "og:description",
        content: "نوافذ العمل الأسبوعية والإجازات والاستثناءات التي تحدد الفتحات المتاحة للحجز.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AvailabilitySettingsPage,
});

function AvailabilitySettingsPage() {
  const { session, role, tenantId, loading } = useSession();
  const canEdit = role === "owner" || role === "branch_manager" || role === "super_admin";
  const [staffId, setStaffId] = useState<string | null>(null);

  const staffQuery = useQuery({
    queryKey: ["availability-staff", tenantId],
    queryFn: () => fetchStaffOptions(tenantId as string),
    enabled: Boolean(tenantId) && canEdit,
  });

  const branchesQuery = useQuery({
    queryKey: ["branches", tenantId],
    queryFn: () => fetchBranches(tenantId as string),
    enabled: Boolean(tenantId) && canEdit,
  });

  const staff = staffQuery.data ?? [];
  useEffect(() => {
    if (!staffId && staff.length > 0) setStaffId(staff[0]!.id);
  }, [staff, staffId]);
  const selected = staff.find((s) => s.id === staffId) ?? null;
  const branch = (branchesQuery.data ?? []).find((b) => b.id === selected?.branchId) ?? null;

  const shellProps = {
    title: "إدارة التوفر",
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
          إدارة التوفر متاحة لمدير الفرع والمالك فقط.
        </InlineAlert>
      </AppShell>
    );
  }

  return (
    <AppShell {...shellProps}>
      <div className="space-y-6">
        <InlineAlert tone="info" title="مرتبطة بفتحات الحجز">
          نوافذ العمل تحدد الفتحات المعروضة في صفحة الحجز العامة وفي التقويم، والاستثناءات تُخفي
          الفتحات داخل مدتها. التخزين بتوقيت UTC والعرض بتوقيت الفرع.
        </InlineAlert>

        {staffQuery.isPending ? (
          <Skeleton className="h-64 w-full" />
        ) : staffQuery.isError ? (
          <ErrorState
            title="تعذّر تحميل مقدمي الخدمة"
            message="حدث خطأ أثناء جلب فريق العمل."
            onRetry={() => void staffQuery.refetch()}
          />
        ) : staff.length === 0 ? (
          <EmptyState
            icon={Users}
            title="لا مقدمي خدمة بعد"
            hint="أضف مقدم خدمة أولًا لتضبط نوافذ عمله."
          />
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {staff.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => setStaffId(member.id)}
                  className={
                    member.id === staffId
                      ? "rounded-lg border border-accent-600 bg-accent-50 px-4 py-2 text-sm font-medium text-accent-700"
                      : "rounded-lg border border-subtle bg-base px-4 py-2 text-sm text-ink-soft hover:bg-subtle"
                  }
                >
                  {member.fullName}
                </button>
              ))}
            </div>

            {selected ? (
              <div className="grid gap-6 lg:grid-cols-2">
                <WorkWindowsCard tenantId={tenantId as string} member={selected} />
                <ExceptionsCard
                  tenantId={tenantId as string}
                  member={selected}
                  timezone={branch?.timezone ?? "Asia/Riyadh"}
                />
              </div>
            ) : null}
          </>
        )}
      </div>
    </AppShell>
  );
}

function WorkWindowsCard({ tenantId, member }: { tenantId: string; member: StaffOption }) {
  const queryClient = useQueryClient();
  const key = ["availability-windows", member.id];
  const query = useQuery({ queryKey: key, queryFn: () => fetchWorkWindows(member.id) });
  const windows = query.data ?? [];

  const [weekday, setWeekday] = useState(0);
  const [from, setFrom] = useState("09:00");
  const [to, setTo] = useState("17:00");
  const [copyTargets, setCopyTargets] = useState<number[]>([]);

  const refresh = () => queryClient.invalidateQueries({ queryKey: key });

  const add = useMutation({
    mutationFn: () =>
      addWorkWindow({
        tenantId,
        staffId: member.id,
        weekday,
        startMinute: timeToMinutes(from),
        endMinute: timeToMinutes(to),
        existing: windows,
      }),
    onSuccess: () => {
      toast.success("أُضيفت نافذة العمل");
      void refresh();
    },
    onError: (error: Error) => toast.error(availabilityErrorMessage(error.message)),
  });

  const toggle = useMutation({
    mutationFn: (input: { id: string; isActive: boolean }) =>
      toggleWorkWindow(input.id, input.isActive),
    onSuccess: () => void refresh(),
    onError: (error: Error) => toast.error(availabilityErrorMessage(error.message)),
  });

  const remove = useMutation({
    mutationFn: (id: string) => removeWorkWindow(id),
    onSuccess: () => {
      toast.success("أُزيلت النافذة");
      void refresh();
    },
    onError: (error: Error) => toast.error(availabilityErrorMessage(error.message)),
  });

  const copy = useMutation({
    mutationFn: () =>
      copyDayWindows({
        tenantId,
        staffId: member.id,
        windows,
        fromWeekday: weekday,
        toWeekdays: copyTargets,
      }),
    onSuccess: () => {
      toast.success("نُسخ جدول اليوم");
      setCopyTargets([]);
      void refresh();
    },
    onError: (error: Error) => toast.error(availabilityErrorMessage(error.message)),
  });

  const grouped = useMemo(() => {
    const map = new Map<number, WorkWindow[]>();
    for (const day of WEEKDAYS) map.set(day.value, []);
    for (const w of windows) map.get(w.weekday)?.push(w);
    return map;
  }, [windows]);

  const totalHours = windows
    .filter((w) => w.isActive)
    .reduce((sum, w) => sum + (w.endMinute - w.startMinute) / 60, 0);

  return (
    <section className="rounded-xl border border-subtle bg-base p-6">
      <h2 className="mb-2 flex items-center gap-2 text-base font-semibold text-primary">
        <Clock className="size-4 text-accent-600" aria-hidden />
        نوافذ العمل الأسبوعية
      </h2>
      <p className="mb-6 text-xs text-ink-soft">
        إجمالي ساعات العمل الفعّالة أسبوعيًا: <MonoText>{totalHours.toFixed(1)}</MonoText> ساعة.
      </p>

      <div className="mb-6 space-y-4 rounded-lg border border-subtle bg-subtle p-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="win-day">اليوم</Label>
            <select
              id="win-day"
              value={weekday}
              onChange={(e) => setWeekday(Number(e.target.value))}
              className="h-10 w-full rounded-lg border border-subtle bg-base px-3 text-sm text-primary"
            >
              {WEEKDAYS.map((day) => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="win-from">من</Label>
            <Input
              id="win-from"
              type="time"
              className="mono-ltr"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="win-to">إلى</Label>
            <Input
              id="win-to"
              type="time"
              className="mono-ltr"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
        </div>
        <Button onClick={() => add.mutate()} loading={add.isPending} className="w-full">
          <Plus className="size-4" aria-hidden />
          إضافة نافذة عمل
        </Button>

        <div className="space-y-2 border-t border-subtle pt-4">
          <Label>نسخ جدول {WEEKDAYS[weekday]?.label} إلى</Label>
          <div className="flex flex-wrap gap-2">
            {WEEKDAYS.filter((d) => d.value !== weekday).map((day) => {
              const active = copyTargets.includes(day.value);
              return (
                <button
                  key={day.value}
                  type="button"
                  onClick={() =>
                    setCopyTargets((prev) =>
                      active ? prev.filter((v) => v !== day.value) : [...prev, day.value],
                    )
                  }
                  className={
                    active
                      ? "rounded-lg border border-accent-600 bg-accent-50 px-3 py-1.5 text-xs font-medium text-accent-700"
                      : "rounded-lg border border-subtle bg-base px-3 py-1.5 text-xs text-ink-soft hover:bg-subtle"
                  }
                >
                  {day.label}
                </button>
              );
            })}
          </div>
          <Button
            variant="outline"
            onClick={() => copy.mutate()}
            loading={copy.isPending}
            disabled={copyTargets.length === 0}
            className="w-full"
          >
            <Copy className="size-4" aria-hidden />
            نسخ (يستبدل جدول الأيام المحددة)
          </Button>
        </div>
      </div>

      {query.isPending ? (
        <Skeleton className="h-40 w-full" />
      ) : query.isError ? (
        <ErrorState
          title="تعذّر تحميل نوافذ العمل"
          message="حدث خطأ أثناء جلب جدول التوفر."
          onRetry={() => void query.refetch()}
        />
      ) : (
        <ul className="divide-y divide-subtle">
          {WEEKDAYS.map((day) => {
            const rows = grouped.get(day.value) ?? [];
            return (
              <li key={day.value} className="py-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-medium text-primary">{day.label}</p>
                  {rows.length === 0 ? <p className="text-xs text-faint">مغلق</p> : null}
                </div>
                <div className="space-y-2">
                  {rows.map((w) => (
                    <div
                      key={w.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-subtle bg-subtle px-3 py-2"
                    >
                      <MonoText className="text-sm text-primary">
                        {minutesToTime(w.startMinute)} – {minutesToTime(w.endMinute)}
                      </MonoText>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={w.isActive}
                          onCheckedChange={(v) => toggle.mutate({ id: w.id, isActive: v })}
                          aria-label={`تفعيل نافذة ${day.label}`}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => remove.mutate(w.id)}
                          aria-label={`إزالة نافذة ${day.label}`}
                        >
                          <Trash2 className="size-4 text-danger-fg" aria-hidden />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function ExceptionsCard({
  tenantId,
  member,
  timezone,
}: {
  tenantId: string;
  member: StaffOption;
  timezone: string;
}) {
  const queryClient = useQueryClient();
  const key = ["availability-exceptions", tenantId, member.id];
  const query = useQuery({
    queryKey: key,
    queryFn: () => fetchExceptions(tenantId, member.id, member.branchId),
  });

  const [scope, setScope] = useState<"staff" | "branch">("staff");
  const [date, setDate] = useState("");
  const [fromTime, setFromTime] = useState("00:00");
  const [toTime, setToTime] = useState("23:59");
  const [reason, setReason] = useState("");

  const refresh = () => queryClient.invalidateQueries({ queryKey: key });

  const add = useMutation({
    mutationFn: () =>
      addException({
        tenantId,
        staffId: scope === "staff" ? member.id : null,
        branchId: member.branchId,
        timezone,
        date,
        fromTime,
        toTime,
        reason,
      }),
    onSuccess: () => {
      toast.success("أُضيف الاستثناء");
      setDate("");
      setReason("");
      void refresh();
    },
    onError: (error: Error) => toast.error(availabilityErrorMessage(error.message)),
  });

  const remove = useMutation({
    mutationFn: (id: string) => removeException(id),
    onSuccess: () => {
      toast.success("أُزيل الاستثناء");
      void refresh();
    },
    onError: (error: Error) => toast.error(availabilityErrorMessage(error.message)),
  });

  const fmt = (iso: string) =>
    new Intl.DateTimeFormat("ar", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: timezone,
    }).format(new Date(iso));

  return (
    <section className="rounded-xl border border-subtle bg-base p-6">
      <h2 className="mb-2 flex items-center gap-2 text-base font-semibold text-primary">
        <CalendarOff className="size-4 text-accent-600" aria-hidden />
        الإجازات والاستثناءات
      </h2>
      <p className="mb-6 text-xs text-ink-soft">
        استثناء لمقدم الخدمة يعطّل فتحاته فقط، واستثناء الفرع يعطّل كل الفتحات في الفرع.
      </p>

      <div className="mb-6 space-y-4 rounded-lg border border-subtle bg-subtle p-4">
        <div className="flex gap-2">
          {(
            [
              { value: "staff", label: `إجازة ${member.fullName}` },
              { value: "branch", label: "إجازة الفرع" },
            ] as const
          ).map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setScope(option.value)}
              className={
                scope === option.value
                  ? "rounded-lg border border-accent-600 bg-accent-50 px-3 py-1.5 text-xs font-medium text-accent-700"
                  : "rounded-lg border border-subtle bg-base px-3 py-1.5 text-xs text-ink-soft hover:bg-subtle"
              }
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          <Label htmlFor="exc-date">التاريخ</Label>
          <Input
            id="exc-date"
            type="date"
            className="mono-ltr"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="exc-from">من الساعة</Label>
            <Input
              id="exc-from"
              type="time"
              className="mono-ltr"
              value={fromTime}
              onChange={(e) => setFromTime(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="exc-to">إلى الساعة</Label>
            <Input
              id="exc-to"
              type="time"
              className="mono-ltr"
              value={toTime}
              onChange={(e) => setToTime(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="exc-reason">السبب</Label>
          <Input
            id="exc-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="اجتماع، سفر، عطلة…"
          />
        </div>
        <Button
          onClick={() => add.mutate()}
          loading={add.isPending}
          disabled={!date}
          className="w-full"
        >
          <Plus className="size-4" aria-hidden />
          إضافة استثناء
        </Button>
      </div>

      {query.isPending ? (
        <Skeleton className="h-24 w-full" />
      ) : query.isError ? (
        <ErrorState
          title="تعذّر تحميل الاستثناءات"
          message="حدث خطأ أثناء جلب الإجازات."
          onRetry={() => void query.refetch()}
        />
      ) : (query.data ?? []).length === 0 ? (
        <EmptyState
          icon={CalendarOff}
          title="لا استثناءات مسجَّلة"
          hint="التوفر يتبع نوافذ العمل الأسبوعية."
        />
      ) : (
        <ul className="divide-y divide-subtle">
          {(query.data ?? []).map((exception) => (
            <li key={exception.id} className="flex items-center justify-between gap-4 py-3">
              <div>
                <p className="text-sm font-medium text-primary">
                  {exception.reason}
                  <span className="ms-2 text-xs text-faint">
                    {exception.staffId ? "مقدم خدمة" : "الفرع"}
                  </span>
                </p>
                <MonoText className="text-xs text-ink-soft">
                  {fmt(exception.startsAt)} → {fmt(exception.endsAt)}
                </MonoText>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => remove.mutate(exception.id)}
                aria-label={`إزالة ${exception.reason}`}
              >
                <Trash2 className="size-4 text-danger-fg" aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
