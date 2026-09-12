import type { AppRole } from "@/integrations/supabase/types";

export const APP_ROLES = ["student", "employee", "team_leader", "admin", "super_admin"] as const;

export const ROLE_LEVEL: Record<AppRole, number> = {
  student: 0,
  employee: 1,
  team_leader: 2,
  admin: 3,
  super_admin: 4,
};

export const ROLE_PERMISSION_GRANTS = {
  student: ["learning.read", "learning.progress.write", "profile.self.manage", "leaderboard.read"],
  employee: ["admin.dashboard.read", "tasks.self.manage"],
  team_leader: ["team.read", "team.tasks.read"],
  admin: ["accounts.manage_below", "content.manage", "learning.admin", "health.read"],
  super_admin: ["admins.manage", "tasks.all.manage", "system.manage"],
} as const satisfies Record<AppRole, readonly string[]>;

export type AppPermission = (typeof ROLE_PERMISSION_GRANTS)[AppRole][number];

export function permissionsForRole(role: AppRole): ReadonlySet<AppPermission> {
  return new Set(
    APP_ROLES.slice(0, ROLE_LEVEL[role] + 1).flatMap(
      (inheritedRole) => ROLE_PERMISSION_GRANTS[inheritedRole],
    ),
  );
}

export function mobileEffectiveRole(_accountRole: AppRole): "student" {
  return "student";
}

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

export function canInviteRole(actor: AppRole, invited: AppRole) {
  return invited !== "super_admin" && canManageRole(actor, invited);
}

export function canChangeMemberStatus(actor: AppRole, target: AppRole, sameAccount: boolean) {
  return !sameAccount && canManageRole(actor, target);
}
