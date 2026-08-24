import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

export type AppointmentStatus =
  "confirmed" | "pending_deposit" | "completed" | "cancelled" | "no_show";

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-caption font-medium",
  {
    variants: {
      status: {
        confirmed: "border-accent-100 bg-accent-50 text-accent-700",
        pending_deposit: "border-warning-bg bg-warning-bg text-warning-fg",
        completed: "border-success-bg bg-success-bg text-success-fg",
        cancelled: "border-border bg-surface-subtle text-muted-foreground",
        no_show: "border-danger-bg bg-danger-bg text-danger-fg",
      },
    },
    defaultVariants: { status: "confirmed" },
  },
);

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  confirmed: "مؤكد",
  pending_deposit: "بانتظار العربون",
  completed: "مكتمل",
  cancelled: "ملغي",
  no_show: "لم يحضر",
};

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof statusBadgeVariants> {
  status: AppointmentStatus;
}

export function StatusBadge({ status, className, ...props }: StatusBadgeProps) {
  return (
    <span className={cn(statusBadgeVariants({ status }), className)} {...props}>
      {STATUS_LABEL[status]}
    </span>
  );
}

export { STATUS_LABEL };
