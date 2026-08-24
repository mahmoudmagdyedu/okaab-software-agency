import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useEffect, useMemo, useRef, useState } from "react";

import { AppShell } from "@/components/mawid/app-shell";
import { EmptyState } from "@/components/mawid/empty-state";
import { ErrorState } from "@/components/mawid/error-state";
import { InlineAlert } from "@/components/mawid/inline-alert";
import { MonoText } from "@/components/mawid/mono-text";
import { AppointmentDrawer } from "@/components/mawid/calendar/appointment-drawer";
import { CalendarToolbar } from "@/components/mawid/calendar/calendar-toolbar";
import {
  QuickCreatePopover,
  type QuickCreatePayload,
  type QuickCreateTarget,
} from "@/components/mawid/calendar/quick-create-popover";
import { AppointmentBody, WeekGrid, type DropTarget } from "@/components/mawid/calendar/week-grid";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import {
  addDaysKey,
  dayNumberLabel,
  fetchCalendarWeek,
  weekStartOf,
  weekdayLabel,
  DAY_END_MINUTE,
  DAY_START_MINUTE,
  minuteLabel,
  type CalendarAppointment,
  type CalendarWeek,
} from "@/lib/calendar";
import { formatDateKey, zonedToUtc } from "@/lib/slots";
import type { AppointmentStatus } from "@/components/mawid/status-badge";
import { cn } from "@/lib/utils";

const SLOT_TAKEN_MESSAGE = "للأسف حُجز هذا الموعد للتو من عميل آخر — اختر وقتًا آخر من المتاح";

export const Route = createFileRoute("/_authenticated/app/calendar")({
  head: () => ({
    meta: [
      { title: "التقويم الأسبوعي — مَوعِد" },
      {
        name: "description",
        content: "تقويم أسبوعي بأعمدة لكل مقدم خدمة مع السحب والإفلات والإنشاء السريع للمواعيد.",
      },
      { property: "og:title", content: "التقويم الأسبوعي — مَوعِد" },
      {
        property: "og:description",
        content: "تقويم أسبوعي بأعمدة لكل مقدم خدمة مع السحب والإفلات والإنشاء السريع للمواعيد.",
      },
    ],
  }),
  component: CalendarPage,
});

function CalendarPage() {
  const { session, role, tenantId, loading } = useSession();
  const todayKey = formatDateKey(new Date(), "Africa/Cairo");
  const [weekStart, setWeekStart] = useState(() => weekStartOf(todayKey));
  const [selectedDay, setSelectedDay] = useState(todayKey);

  const query = useQuery({
    queryKey: ["calendar", tenantId, weekStart],
    queryFn: () => fetchCalendarWeek(tenantId as string, weekStart),
    enabled: Boolean(tenantId),
  });

  const userName =
    (session?.user.user_metadata as { full_name?: string } | undefined)?.full_name ||
    session?.user.email ||
    "مستخدم";

  return (
    <AppShell
      title="التقويم الأسبوعي"
      role={role}
      userName={userName}
      tenantName={query.data?.tenantName ?? "…"}
    >
      {loading || query.isPending ? (
        <CalendarSkeleton />
      ) : query.isError ? (
        <ErrorState
          title="تعذّر تحميل التقويم"
          message="حدث خلل أثناء جلب مواعيد الأسبوع. تحقّق من الاتصال ثم أعد المحاولة."
          onRetry={() => void query.refetch()}
        />
      ) : (
        <CalendarBoard
          board={query.data}
          tenantId={tenantId as string}
          weekStart={weekStart}
          selectedDay={selectedDay}
          todayKey={todayKey}
          onSelectDay={setSelectedDay}
          onWeekChange={(next) => {
            setWeekStart(next);
            setSelectedDay(next);
          }}
          onToday={() => {
            setWeekStart(weekStartOf(todayKey));
            setSelectedDay(todayKey);
          }}
        />
      )}
    </AppShell>
  );
}

interface BoardProps {
  board: CalendarWeek;
  tenantId: string;
  weekStart: string;
  selectedDay: string;
  todayKey: string;
  onSelectDay: (day: string) => void;
  onWeekChange: (weekStart: string) => void;
  onToday: () => void;
}

function CalendarBoard({
  board,
  tenantId,
  weekStart,
  selectedDay,
  todayKey,
  onSelectDay,
  onWeekChange,
  onToday,
}: BoardProps) {
  const queryClient = useQueryClient();
  const [hiddenStaff, setHiddenStaff] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [dragging, setDragging] = useState<CalendarAppointment | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
  const [quickTarget, setQuickTarget] = useState<QuickCreateTarget | null>(null);
  const [popoverPos, setPopoverPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [selected, setSelected] = useState<CalendarAppointment | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [quickError, setQuickError] = useState<string | null>(null);
  const pointer = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  );

  useEffect(() => {
    if (!quickTarget && !selected) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setQuickTarget(null);
      setSelected(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [quickTarget, selected]);

  const placePopover = (x: number, y: number) => {
    setPopoverPos({
      x: Math.max(12, Math.min(x, window.innerWidth - 332)),
      y: Math.max(12, Math.min(y, window.innerHeight - 492)),
    });
  };

  const visibleStaff = board.staff.filter((s) => !hiddenStaff.includes(s.id));
  const dayAppointments = useMemo(
    () =>
      board.appointments.filter(
        (appt) =>
          appt.dateKey === selectedDay &&
          (search.trim() === "" || appt.customerName.includes(search.trim())),
      ),
    [board.appointments, selectedDay, search],
  );

  const occupancy = useMemo(() => {
    const total = DAY_END_MINUTE - DAY_START_MINUTE;
    const acc: Record<string, number> = {};
    for (const member of board.staff) {
      const booked = dayAppointments
        .filter((a) => a.staffId === member.id && a.status !== "cancelled")
        .reduce((sum, a) => sum + a.durationMinutes, 0);
      acc[member.id] = Math.round((booked / total) * 100);
    }
    return acc;
  }, [board.staff, dayAppointments]);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["calendar", tenantId, weekStart] });

  const rescheduleMutation = useMutation({
    mutationFn: async (input: { id: string; staffId: string; startsAt: string }) => {
      const { error } = await supabase.rpc("reschedule_appointment", {
        _appointment_id: input.id,
        _staff_id: input.staffId,
        _starts_at: input.startsAt,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setBanner(null);
      void invalidate();
    },
    onError: (error: { message?: string }) => {
      setBanner(
        error.message?.includes("slot_taken")
          ? SLOT_TAKEN_MESSAGE
          : "تعذّر نقل الموعد. أعد المحاولة.",
      );
    },
  });

  const statusMutation = useMutation({
    mutationFn: async (input: { id: string; status: AppointmentStatus }) => {
      const { error } = await supabase.rpc("set_appointment_status", {
        _appointment_id: input.id,
        _status: input.status,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setSelected(null);
      void invalidate();
    },
    onError: () => setBanner("تعذّر تحديث حالة الموعد. أعد المحاولة."),
  });

  const createMutation = useMutation({
    mutationFn: async (payload: QuickCreatePayload) => {
      let customerId = payload.customerId;
      if (!customerId && payload.newCustomer) {
        const { data, error } = await supabase
          .from("customers")
          .insert({
            tenant_id: tenantId,
            full_name: payload.newCustomer.fullName,
            phone: payload.newCustomer.phone,
          })
          .select("id")
          .single();
        if (error) throw error;
        customerId = data.id;
      }
      if (!customerId) throw new Error("customer_missing");
      const startsAt = zonedToUtc(payload.dateKey, payload.minute, board.timeZone).toISOString();
      const { error } = await supabase.rpc("book_appointment", {
        _tenant_id: tenantId,
        _staff_id: payload.staffId,
        _service_id: payload.serviceId,
        _customer_id: customerId,
        _starts_at: startsAt,
        _note: "",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setQuickTarget(null);
      setQuickError(null);
      void invalidate();
    },
    onError: (error: { message?: string }) => {
      setQuickError(
        error.message?.includes("slot_taken")
          ? SLOT_TAKEN_MESSAGE
          : "تعذّر حفظ الموعد. راجع البيانات ثم أعد المحاولة.",
      );
    },
  });

  const evaluateTarget = (
    staffId: string,
    minute: number,
    appt: CalendarAppointment,
  ): DropTarget => {
    const startsAt = zonedToUtc(selectedDay, minute, board.timeZone).getTime();
    const endsAt = startsAt + appt.durationMinutes * 60000;
    const clash = board.appointments.find(
      (other) =>
        other.id !== appt.id &&
        other.staffId === staffId &&
        other.status !== "cancelled" &&
        new Date(other.startsAt).getTime() < endsAt &&
        startsAt < new Date(other.endsAt).getTime(),
    );
    const staffName = board.staff.find((s) => s.id === staffId)?.fullName ?? "";
    return {
      staffId,
      minute,
      available: !clash,
      message: clash
        ? `يتعارض مع موعد ${staffName} الساعة ${clash.startLabel}`
        : `متاح الساعة ${minuteLabel(minute)}`,
    };
  };

  const onDragStart = (event: DragStartEvent) => {
    const appt = (event.active.data.current as { appointment?: CalendarAppointment } | undefined)
      ?.appointment;
    setDragging(appt ?? null);
    setBanner(null);
  };

  const onDragOver = (event: DragOverEvent) => {
    const data = event.over?.data.current as { staffId?: string; minute?: number } | undefined;
    if (!data?.staffId || data.minute === undefined || !dragging) {
      setDropTarget(null);
      return;
    }
    setDropTarget(evaluateTarget(data.staffId, data.minute, dragging));
  };

  const onDragEnd = async (event: DragEndEvent) => {
    const appt = dragging;
    const data = event.over?.data.current as { staffId?: string; minute?: number } | undefined;
    setDragging(null);
    setDropTarget(null);
    if (!appt || !data?.staffId || data.minute === undefined) return;

    const startsAt = zonedToUtc(selectedDay, data.minute, board.timeZone).toISOString();
    const endsAt = new Date(
      new Date(startsAt).getTime() + appt.durationMinutes * 60000,
    ).toISOString();

    // تحقق لحظي من التعارض عبر الـ API قبل التثبيت
    const { data: check, error } = await supabase.rpc("check_slot_conflict", {
      _staff_id: data.staffId,
      _starts_at: startsAt,
      _ends_at: endsAt,
      _exclude_appointment_id: appt.id,
    });
    if (error) {
      setBanner("تعذّر التحقق من التعارض. أعد المحاولة.");
      return;
    }
    const row = Array.isArray(check) ? check[0] : check;
    if (row?.conflicts) {
      setBanner(SLOT_TAKEN_MESSAGE);
      return;
    }
    rescheduleMutation.mutate({ id: appt.id, staffId: data.staffId, startsAt });
  };

  return (
    <div
      className="space-y-4"
      onPointerDownCapture={(event) => {
        pointer.current = { x: event.clientX, y: event.clientY };
      }}
    >
      <CalendarToolbar
        weekLabel={`${weekStart} — ${addDaysKey(weekStart, 6)}`}
        staff={board.staff}
        activeStaffIds={visibleStaff.map((s) => s.id)}
        query={search}
        onQueryChange={setSearch}
        onToggleStaff={(id) =>
          setHiddenStaff((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
          )
        }
        onPrevWeek={() => onWeekChange(addDaysKey(weekStart, -7))}
        onNextWeek={() => onWeekChange(addDaysKey(weekStart, 7))}
        onToday={onToday}
        onNewAppointment={() => {
          const first = visibleStaff[0];
          if (!first) return;
          placePopover(window.innerWidth / 2 - 160, 120);
          setQuickError(null);
          setQuickTarget({ staffId: first.id, minute: DAY_START_MINUTE, dateKey: selectedDay });
        }}
      />

      <div className="flex gap-1.5 overflow-x-auto">
        {board.days.map((day) => (
          <button
            key={day}
            type="button"
            aria-pressed={day === selectedDay}
            onClick={() => onSelectDay(day)}
            className={cn(
              "min-h-10 shrink-0 rounded-[6px] border px-3 py-1.5 text-body-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-600)]",
              day === selectedDay
                ? "border-accent-600 bg-accent-50 text-accent-700"
                : "border-[var(--border-subtle)] bg-[var(--bg-base)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]",
              day === todayKey && day !== selectedDay && "border-accent-100",
            )}
          >
            {weekdayLabel(day)} <MonoText>{dayNumberLabel(day)}</MonoText>
          </button>
        ))}
      </div>

      {banner ? <InlineAlert tone="danger">{banner}</InlineAlert> : null}

      {board.staff.length === 0 ? (
        <EmptyState
          title="لا مقدمي خدمة بعد"
          hint="أضف أول مقدم خدمة لتظهر جداوله هنا."
          actionLabel="إضافة مقدم خدمة"
        />
      ) : visibleStaff.length === 0 ? (
        <EmptyState
          title="كل الأعمدة مخفية"
          hint="فعّل مقدم خدمة واحدًا على الأقل من شريط الفلترة لعرض جدوله."
        />
      ) : (
        <DndContext
          sensors={sensors}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragEnd={(event) => void onDragEnd(event)}
          onDragCancel={() => {
            setDragging(null);
            setDropTarget(null);
          }}
        >
          <WeekGrid
            staff={visibleStaff}
            appointments={dayAppointments}
            occupancy={occupancy}
            dropTarget={dropTarget}
            draggingId={dragging?.id ?? null}
            onCellClick={(staffId, minute) => {
              placePopover(pointer.current.x - 160, pointer.current.y - 24);
              setQuickError(null);
              setQuickTarget({ staffId, minute, dateKey: selectedDay });
            }}
            onSelectAppointment={setSelected}
          />

          <DragOverlay dropAnimation={null}>
            {dragging ? (
              <div className="w-[220px]" style={{ height: dragging.durationMinutes * (64 / 30) }}>
                <AppointmentBody appointment={dragging} dragging />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {dayAppointments.length === 0 && visibleStaff.length > 0 ? (
        <EmptyState
          title="لا مواعيد في هذا اليوم"
          hint="انقر على أي خلية فارغة في الجدول لإنشاء موعد سريع."
        />
      ) : null}

      {quickTarget ? (
        <>
          <button
            type="button"
            aria-label="إغلاق نافذة الإنشاء السريع"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setQuickTarget(null)}
          />
          <div className="fixed z-50" style={{ left: popoverPos.x, top: popoverPos.y }}>
            <QuickCreatePopover
              target={quickTarget}
              tenantId={tenantId}
              staff={board.staff}
              services={board.services}
              submitting={createMutation.isPending}
              errorMessage={quickError}
              onCancel={() => setQuickTarget(null)}
              onSubmit={(payload) => createMutation.mutate(payload)}
            />
          </div>
        </>
      ) : null}

      {selected ? (
        <>
          <button
            type="button"
            aria-label="إغلاق تفاصيل الموعد"
            className="fixed inset-0 z-40 cursor-default bg-[color-mix(in_srgb,var(--text-primary)_35%,transparent)]"
            onClick={() => setSelected(null)}
          />
          <AppointmentDrawer
            appointment={selected}
            timeZone={board.timeZone}
            busy={statusMutation.isPending}
            onClose={() => setSelected(null)}
            onStatusChange={(status) => statusMutation.mutate({ id: selected.id, status })}
            onReschedule={() => {
              setSelected(null);
              setBanner("اسحب بطاقة الموعد إلى الوقت الجديد لإعادة الجدولة.");
            }}
          />
        </>
      ) : null}
    </div>
  );
}

function CalendarSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-[68px] rounded-[6px]" />
      <div className="flex gap-1.5">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-10 w-[96px] rounded-[6px]" />
        ))}
      </div>
      <div className="flex gap-0 overflow-hidden rounded-[6px] border border-[var(--border-subtle)]">
        <Skeleton className="h-[520px] w-[72px] rounded-none" />
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[520px] flex-1 rounded-none" />
        ))}
      </div>
    </div>
  );
}
