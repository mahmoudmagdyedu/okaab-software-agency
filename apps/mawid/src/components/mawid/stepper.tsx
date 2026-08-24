import * as React from "react";

import { cn } from "@/lib/utils";

export interface StepperProps extends React.HTMLAttributes<HTMLElement> {
  steps: string[];
  current: number;
}

export function Stepper({ steps, current, className, ...props }: StepperProps) {
  return (
    <nav aria-label="خطوات الحجز" className={cn("w-full", className)} {...props}>
      <ol className="flex items-center gap-2">
        {steps.map((label, index) => {
          const state = index < current ? "done" : index === current ? "current" : "todo";
          return (
            <li key={label} className="flex min-w-0 flex-1 flex-col gap-2">
              <span
                className={cn(
                  "h-1 w-full rounded-sm",
                  state === "todo" ? "bg-border" : "bg-accent-600",
                )}
              />
              <span
                className={cn(
                  "truncate text-caption",
                  state === "current"
                    ? "font-medium text-foreground"
                    : state === "done"
                      ? "text-accent-700"
                      : "text-faint",
                )}
                aria-current={state === "current" ? "step" : undefined}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
