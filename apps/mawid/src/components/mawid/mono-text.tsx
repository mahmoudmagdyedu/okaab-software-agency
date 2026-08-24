import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * جزيرة LTR داخل النص العربي: الأوقات، الأرقام، المبالغ، أرقام الجوال.
 */
export interface MonoTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  as?: "span" | "div" | "time";
}

export function MonoText({ as = "span", className, children, ...props }: MonoTextProps) {
  const Comp = as;
  return (
    <Comp className={cn("mono-ltr", className)} {...props}>
      {children}
    </Comp>
  );
}
