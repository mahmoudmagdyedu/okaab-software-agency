import { useQuery } from "@tanstack/react-query";
import { CalendarClock, CheckCircle2, Clock, UserCheck, UserX, X } from "lucide-react";

import { LetterAvatar } from "@/components/mawid/letter-avatar";
import { MonoText } from "@/components/mawid/mono-text";
import { StatusBadge } from "@/components/mawid/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  EVENT_LABELS,
  fetchAppointmentEvents,
  moneyLabel,
  type CalendarAppointment,
} from "@/lib/calendar";
import { formatTime } from "@/lib/slots";
import type { AppointmentStatus } from "@/components/mawid/status-badge";

export interface AppointmentDrawerProps {
  appointment: CalendarAppointment;
  timeZone: string;
  busy: boolean;
  onClose: () => void;
  onStatusChange: (status: AppointmentStatus) => void;
  onReschedule: () => void;
}

export function AppointmentDrawer({
  appointment,
  timeZone,
  busy,
  onClose,
  onStatusChange,
  onReschedule,
}: AppointmentDrawerProps) {
  const events = useQuery({
    queryKey: ["appointment-events", appointment.id],
    queryFn: () => fetchAppointmentEvents(appointment.id),
  });

  return (
    <aside
      role="dialog"
      aria-modal="true"
      aria-label="تفاصيل الموعد"
      className="fixed inset-y-0 left-0 z-50 flex w-full max-w-[420px] flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-base)] shadow-modal"
    >
      <header className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3">
        <h2 className="text-h3 font-semibold text-[var(--text-primary)]">تفاصيل الموعد</h2>
        <Button variant="ghost" size="icon" aria-label="إغلاق" onClick={onClose} autoFocus>
          <X className="size-[18px]" strokeWidth={1.5} aria-hidden />
        </Button>
      </header>

      <div className="flex-1 space-y-5 overflow-y-auto p-4">
        <div className="flex items-center gap-3">
          <LetterAvatar name={appointment.customerName} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-body font-medium text-[var(--text-primary)]">
              {appointment.customerName}
            </p>
            <MonoText className="text-body-sm text-[var(--text-secondary)]">
              {appointment.customerPhone}
            </MonoText>
          </div>
          <StatusBadge status={appointment.status} />
        </div>

        <dl className="space-y-3 rounded-[6px] border border-[var(--border-subtle)] p-3">
          <Row label="الخدمة" value={appointment.serviceName} />
          <Row label="الوقت" value={`${appointment.startLabel} – ${appointment.endLabel}`} mono />
          <Row label="المدة" value={`${appointment.durationMinutes} دقيقة`} mono />
          <Row label="السعر" value={moneyLabel(appointment.priceCents)} mono />
          <Row
            label="العربون"
            value={`${moneyLabel(appointment.depositPaidCents)} من ${moneyLabel(appointment.depositCents)}`}
            mono
          />
          <Row label="رقم الحجز" value={appointment.bookingRef} mono />
        </dl>

        <section>
          <h3 className="mb-2 text-body-sm font-medium text-[var(--text-primary)]">سجل الأحداث</h3>
          {events.isPending ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-2/3" />
            </div>
          ) : events.isError ? (
            <p className="text-body-sm text-danger-fg">
              تعذّر تحميل سجل الأحداث.{" "}
              <button type="button" className="underline" onClick={() => void events.refetch()}>
                إعادة المحاولة
              </button>
            </p>
          ) : events.data.length === 0 ? (
            <p className="text-body-sm text-[var(--text-muted)]">لا أحداث مسجّلة بعد.</p>
          ) : (
            <ul className="space-y-2">
              {events.data.map((event) => (
                <li key={event.id} className="flex items-center gap-2 text-body-sm">
                  <Clock
                    className="size-4 text-[var(--text-muted)]"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                  <span className="text-[var(--text-secondary)]">
                    {EVENT_LABELS[event.eventType] ?? event.eventType}
                  </span>
                  <MonoText className="ms-auto text-caption text-[var(--text-muted)]">
                    {formatTime(event.createdAt, timeZone)}
                  </MonoText>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <footer className="grid grid-cols-2 gap-2 border-t border-[var(--border-subtle)] p-4">
        <Button
          className="gap-2"
          disabled={busy || appointment.status === "confirmed"}
          onClick={() => onStatusChange("confirmed")}
        >
          <CheckCircle2 className="size-4" strokeWidth={1.5} aria-hidden />
          تأكيد
        </Button>
        <Button variant="outline" className="gap-2" disabled={busy} onClick={onReschedule}>
          <CalendarClock className="size-4" strokeWidth={1.5} aria-hidden />
          إعادة جدولة
        </Button>
        <Button
          variant="outline"
          className="gap-2"
          disabled={busy}
          onClick={() => onStatusChange("completed")}
        >
          <UserCheck className="size-4" strokeWidth={1.5} aria-hidden />
          تسجيل حضور
        </Button>
        <Button
          variant="outline"
          className="gap-2"
          disabled={busy}
          onClick={() => onStatusChange("no_show")}
        >
          <UserX className="size-4" strokeWidth={1.5} aria-hidden />
          لم يحضر
        </Button>
        <Button
          variant="destructive"
          className="col-span-2"
          disabled={busy}
          onClick={() => {
            if (window.confirm("سيُلغى الموعد ويُخطر العميل. هل تريد المتابعة؟")) {
              onStatusChange("cancelled");
            }
          }}
        >
          إلغاء الموعد
        </Button>
      </footer>
    </aside>
  );
}

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-body-sm text-[var(--text-secondary)]">{label}</dt>
      <dd className="text-body-sm text-[var(--text-primary)]">
        {mono ? <MonoText>{value}</MonoText> : value}
      </dd>
    </div>
  );
}
