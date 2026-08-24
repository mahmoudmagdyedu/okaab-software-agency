import * as React from "react";

import { cn } from "@/lib/utils";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p.charAt(0)).join("");
}

export interface LetterAvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  name: string;
  size?: "sm" | "md" | "lg";
}

const SIZES: Record<NonNullable<LetterAvatarProps["size"]>, string> = {
  sm: "size-8 text-caption",
  md: "size-10 text-body-sm",
  lg: "size-12 text-h3",
};

export function LetterAvatar({ name, size = "md", className, ...props }: LetterAvatarProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-accent-100 font-semibold text-accent-700",
        SIZES[size],
        className,
      )}
      {...props}
    >
      {initials(name)}
    </span>
  );
}
