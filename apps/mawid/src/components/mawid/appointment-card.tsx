import * as React from "react";

import { cn } from "@/lib/utils";
import { MonoText } from "./mono-text";
import { StatusBadge, type AppointmentStatus } from "./status-badge";

export interface AppointmentCardProps extends React.HTMLAttributes<HTMLDivElement> {
  startTime: string;
  endTime: string;
  customerName: string;
  serviceName: string;
  status: AppointmentStatus;
  /** ارتفاع البطاقة بالبكسل — يتناسب مع المدة (30 دقيقة ≈ 64px) */
  heightPx?: number;
  dragging?: boolean;
}

/** شريط اللون العلوي في الفريم — لون ثابت لكل حالة */
const TOP_BAR: Record<AppointmentStatus, string> = {
  confirmed: "bg-tint-green",
  pending_deposit: "bg-tint-amber",
  completed: "bg-tint-teal",
  cancelled: "bg-tint-red",
  no_show: "bg-tint-pink",
};

export function AppointmentCard({
  startTime,
  endTime,
  customerName,
  serviceName,
  status,
  heightPx,
  dragging = false,
  className,
  style,
  ...props
}: AppointmentCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-sm border border-border bg-background pb-2 pe-3 ps-3 pt-3",
        dragging && "opacity-80",
        className,
      )}
      style={{ height: heightPx, ...style }}
      {...props}
    >
      <span aria-hidden className={cn("absolute inset-x-0 top-0 h-[6px]", TOP_BAR[status])} />

      <div className="flex items-start justify-between gap-2">
        <MonoText className="text-caption font-semibold text-ink">{`${startTime} – ${endTime}`}</MonoText>
        <StatusBadge status={status} />
      </div>
      <p className="mt-1 truncate text-body-sm font-semibold text-ink">{customerName}</p>
      <p className="truncate text-caption text-ink-soft">{serviceName}</p>
    </div>
  );
}
