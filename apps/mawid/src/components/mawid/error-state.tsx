import * as React from "react";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "تعذّر تحميل البيانات",
  message = "حدث خلل مؤقت أثناء جلب البيانات. جرّب مرة أخرى بعد لحظات.",
  onRetry,
  className,
  ...props
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-md border border-border bg-background px-6 py-12 text-center",
        className,
      )}
      {...props}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-danger-bg">
        <AlertTriangle className="size-5 text-danger-fg" strokeWidth={1.5} aria-hidden />
      </span>
      <h3 className="text-h3 text-foreground">{title}</h3>
      <p className="max-w-sm text-body-sm text-muted-foreground">{message}</p>
      {onRetry ? (
        <Button variant="secondary" className="mt-2" onClick={onRetry}>
          إعادة المحاولة
        </Button>
      ) : null}
    </div>
  );
}
