import type { AppRole } from "@/integrations/supabase/types";

export const APP_ROLES = ["student", "employee", "team_leader", "admin", "super_admin"] as const;

export const ROLE_LEVEL: Record<AppRole, number> = {
  student: 0,
  employee: 1,
  team_leader: 2,
  admin: 3,
  super_admin: 4,
};

export function hasMinimumRole(role: AppRole, minimum: AppRole) {
  return ROLE_LEVEL[role] >= ROLE_LEVEL[minimum];
}

export function isAdminDashboardRole(role: AppRole) {
  return hasMinimumRole(role, "employee");
}

export function canManageRole(actor: AppRole, target: AppRole) {
  if (!hasMinimumRole(actor, "admin") || target === "super_admin") return false;
  return actor === "super_admin" || ROLE_LEVEL[target] < ROLE_LEVEL[actor];
}
