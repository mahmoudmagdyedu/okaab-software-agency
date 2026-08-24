import * as React from "react";

import { cn } from "@/lib/utils";
import { MonoText } from "./mono-text";

export interface SlotChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  time: string;
  selected?: boolean;
}

export function SlotChip({ time, selected = false, className, ...props }: SlotChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        "inline-flex h-10 min-w-20 items-center justify-center rounded-md border px-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        selected
          ? "border-accent-600 bg-accent-600 text-primary-foreground"
          : "border-border bg-background text-foreground hover:bg-surface-subtle",
        className,
      )}
      {...props}
    >
      <MonoText className="text-body-sm">{time}</MonoText>
    </button>
  );
}
