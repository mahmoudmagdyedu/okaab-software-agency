import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon;
  title: string;
  hint: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  hint,
  actionLabel,
  onAction,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-md border border-border bg-background px-6 py-12 text-center",
        className,
      )}
      {...props}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-accent-50">
        <Icon className="size-5 text-accent-700" strokeWidth={1.5} aria-hidden />
      </span>
      <h3 className="text-h3 text-foreground">{title}</h3>
      <p className="max-w-sm text-body-sm text-muted-foreground">{hint}</p>
      {actionLabel ? (
        <Button className="mt-2" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
