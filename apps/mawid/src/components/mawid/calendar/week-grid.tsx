import { useDraggable, useDroppable } from "@dnd-kit/core";
import { GripVertical } from "lucide-react";

import { LetterAvatar } from "@/components/mawid/letter-avatar";
import { MonoText } from "@/components/mawid/mono-text";
import { StatusBadge } from "@/components/mawid/status-badge";
import {
  DAY_END_MINUTE,
  DAY_START_MINUTE,
  PX_PER_MINUTE,
  hourMarks,
  minuteLabel,
  type CalendarAppointment,
  type CalendarStaff,
} from "@/lib/calendar";
import { cn } from "@/lib/utils";

const STEP_MINUTES = 15;
const CELL_HEIGHT = STEP_MINUTES * PX_PER_MINUTE; // 32px
const TOTAL_HEIGHT = (DAY_END_MINUTE - DAY_START_MINUTE) * PX_PER_MINUTE;
const TIME_COLUMN_WIDTH = 72;
const MIN_STAFF_COLUMN_WIDTH = 220;

export interface DropTarget {
  staffId: string;
  minute: number;
  available: boolean;
  message: string;
}

export interface WeekGridProps {
  staff: CalendarStaff[];
  appointments: CalendarAppointment[];
  occupancy: Record<string, number>;
  dropTarget: DropTarget | null;
  draggingId: string | null;
  onCellClick: (staffId: string, minute: number) => void;
  onSelectAppointment: (appointment: CalendarAppointment) => void;
}

export function WeekGrid({
  staff,
  appointments,
  occupancy,
  dropTarget,
  draggingId,
  onCellClick,
  onSelectAppointment,
}: WeekGridProps) {
  const steps: number[] = [];
  for (let m = DAY_START_MINUTE; m < DAY_END_MINUTE; m += STEP_MINUTES) steps.push(m);
  const minimumGridWidth = TIME_COLUMN_WIDTH + staff.length * MIN_STAFF_COLUMN_WIDTH;

  return (
    <div className="w-full overflow-x-auto overscroll-x-contain rounded-[6px] border border-[var(--border-subtle)] bg-[var(--bg-base)]">
      <div className="flex w-full" style={{ minWidth: minimumGridWidth }}>
        {/* عمود الوقت — ثابت في أقصى اليمين */}
        <div className="sticky right-0 z-20 w-[72px] shrink-0 border-l border-[var(--border-subtle)] bg-surface-strong">
          <div className="h-[72px] border-b border-[var(--border-subtle)]" />
          <div className="relative" style={{ height: TOTAL_HEIGHT }}>
            {hourMarks().map((minute) => (
              <div
                key={minute}
                className="absolute inset-x-0 -translate-y-1/2 text-center"
                style={{ top: (minute - DAY_START_MINUTE) * PX_PER_MINUTE }}
              >
                <MonoText className="text-caption text-[var(--text-muted)]">
                  {minuteLabel(minute)}
                </MonoText>
              </div>
            ))}
          </div>
        </div>

        {staff.map((member) => (
          <div
            key={member.id}
            className="min-w-[220px] flex-1 border-l border-[var(--border-subtle)] last:border-l-0"
          >
            <div className="flex h-[72px] items-center gap-2 border-b border-[var(--border-subtle)] bg-[var(--bg-base)] px-3">
              <LetterAvatar name={member.fullName} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-body-sm font-medium text-[var(--text-primary)]">
                  {member.fullName}
                </p>
                <p className="truncate text-caption text-[var(--text-muted)]">{member.specialty}</p>
              </div>
              <span className="rounded-md border border-accent-100 bg-accent-50 px-1.5 py-0.5 text-caption text-accent-700">
                <MonoText>{occupancy[member.id] ?? 0}%</MonoText>
              </span>
            </div>

            <div className="relative" style={{ height: TOTAL_HEIGHT }}>
              {steps.map((minute) => (
                <GridCell
                  key={minute}
                  staffId={member.id}
                  minute={minute}
                  dropTarget={dropTarget}
                  onClick={() => onCellClick(member.id, minute)}
                />
              ))}

              {appointments
                .filter((appt) => appt.staffId === member.id && appt.status !== "cancelled")
                .map((appt) => (
                  <DraggableAppointment
                    key={appt.id}
                    appointment={appt}
                    hidden={draggingId === appt.id}
                    onSelect={() => onSelectAppointment(appt)}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GridCell({
  staffId,
  minute,
  dropTarget,
  onClick,
}: {
  staffId: string;
  minute: number;
  dropTarget: DropTarget | null;
  onClick: () => void;
}) {
  const { setNodeRef } = useDroppable({
    id: `cell:${staffId}:${minute}`,
    data: { staffId, minute },
  });
  const isTarget = dropTarget?.staffId === staffId && dropTarget.minute === minute;
  const isHour = minute % 60 === 0;

  return (
    <div
      ref={setNodeRef}
      className="absolute inset-x-0"
      style={{ top: (minute - DAY_START_MINUTE) * PX_PER_MINUTE, height: CELL_HEIGHT }}
    >
      <button
        type="button"
        onClick={onClick}
        aria-label={`إنشاء موعد الساعة ${minuteLabel(minute)}`}
        className={cn(
          "block h-full w-full border-t transition-colors hover:bg-[var(--bg-subtle)] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--accent-600)]",
          isHour
            ? "border-[var(--border-subtle)]"
            : minute % 30 === 0
              ? "border-dashed border-[var(--border-subtle)]"
              : "border-transparent",
          isTarget &&
            (dropTarget?.available
              ? "border-2 border-dashed border-success-fg bg-success-bg"
              : "border-2 border-dashed border-danger-fg bg-danger-bg"),
        )}
      />
      {isTarget && dropTarget && !dropTarget.available ? (
        <span
          role="tooltip"
          className="pointer-events-none absolute -top-9 right-2 z-30 max-w-[220px] rounded-[6px] bg-[var(--text-primary)] px-2 py-1 text-caption text-white shadow-popover"
        >
          {dropTarget.message}
        </span>
      ) : null}
    </div>
  );
}

function DraggableAppointment({
  appointment,
  hidden,
  onSelect,
}: {
  appointment: CalendarAppointment;
  hidden: boolean;
  onSelect: () => void;
}) {
  const { attributes, listeners, setActivatorNodeRef, setNodeRef } = useDraggable({
    id: appointment.id,
    data: { appointment },
  });

  const top = (appointment.startMinute - DAY_START_MINUTE) * PX_PER_MINUTE;
  const height = Math.max(appointment.durationMinutes * PX_PER_MINUTE, 32);

  return (
    <div
      ref={setNodeRef}
      className="absolute inset-x-1.5"
      style={{ top, height, opacity: hidden ? 0.35 : 1 }}
    >
      <button
        type="button"
        onClick={onSelect}
        className="block h-full w-full text-right focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-600)]"
      >
        <AppointmentBody appointment={appointment} />
      </button>
      <button
        ref={setActivatorNodeRef}
        type="button"
        aria-label={`نقل موعد ${appointment.customerName}`}
        className="touch-none absolute bottom-1 left-1 top-2 z-10 flex w-7 cursor-grab items-center justify-center rounded-sm text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--accent-600)] active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" strokeWidth={1.5} aria-hidden />
      </button>
    </div>
  );
}

export function AppointmentBody({
  appointment,
  dragging = false,
}: {
  appointment: CalendarAppointment;
  dragging?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative h-full overflow-hidden rounded-sm border border-border bg-background py-1.5 pe-2 ps-9 pt-2 text-right",
        dragging && "opacity-80 shadow-modal",
      )}
    >
      <span aria-hidden className="absolute inset-x-0 top-0 h-[6px] bg-accent-600" />
      <div className="flex items-start justify-between gap-1.5">
        <MonoText className="text-caption text-accent-700">
          {`${appointment.startLabel} – ${appointment.endLabel}`}
        </MonoText>
        <StatusBadge status={appointment.status} />
      </div>
      <p className="truncate text-body-sm font-medium text-[var(--text-primary)]">
        {appointment.customerName}
      </p>
      <p className="truncate text-body-sm text-[var(--text-secondary)]">
        {appointment.serviceName}
      </p>
    </div>
  );
}
