import type { ReactNode } from "react";

export type AppRole =
  "customer" | "receptionist" | "provider" | "branch_manager" | "owner" | "super_admin";

/**
 * إخفاء الواجهة حسب الدور. الفرض الحقيقي للصلاحيات في سياسات RLS بقاعدة البيانات.
 */
export interface CanProps {
  role: AppRole | null;
  allow: AppRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function Can({ role, allow, children, fallback = null }: CanProps) {
  if (!role || !allow.includes(role)) return <>{fallback}</>;
  return <>{children}</>;
}
