import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const inlineAlertVariants = cva("flex items-start gap-2 rounded-md border p-3 text-body-sm", {
  variants: {
    tone: {
      info: "border-info-bg bg-info-bg text-info-fg",
      success: "border-success-bg bg-success-bg text-success-fg",
      warning: "border-warning-bg bg-warning-bg text-warning-fg",
      danger: "border-danger-bg bg-danger-bg text-danger-fg",
    },
  },
  defaultVariants: { tone: "info" },
});

const TONE_ICON: Record<"info" | "success" | "warning" | "danger", LucideIcon> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: XCircle,
};

export interface InlineAlertProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof inlineAlertVariants> {
  tone?: "info" | "success" | "warning" | "danger";
}

export function InlineAlert({ tone = "info", className, children, ...props }: InlineAlertProps) {
  const Icon = TONE_ICON[tone];
  return (
    <div role="status" className={cn(inlineAlertVariants({ tone }), className)} {...props}>
      <Icon className="mt-0.5 size-4 shrink-0" strokeWidth={1.5} aria-hidden />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
