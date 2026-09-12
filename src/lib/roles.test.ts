import assert from "node:assert/strict";
import test from "node:test";

import {
  APP_ROLES,
  canChangeMemberStatus,
  canInviteRole,
  canManageRole,
  hasMinimumRole,
  isAdminDashboardRole,
  mobileEffectiveRole,
  permissionsForRole,
} from "./roles.ts";

test("roles inherit every capability below them", () => {
  for (const [roleIndex, role] of APP_ROLES.entries()) {
    for (const [minimumIndex, minimum] of APP_ROLES.entries()) {
      assert.equal(
        hasMinimumRole(role, minimum),
        roleIndex >= minimumIndex,
        `${role} -> ${minimum}`,
      );
    }
  }
});

test("student is the only role denied the admin dashboard", () => {
  assert.equal(isAdminDashboardRole("student"), false);
  for (const role of APP_ROLES.filter((item) => item !== "student")) {
    assert.equal(isAdminDashboardRole(role), true, role);
  }
});

test("administrators can only manage roles below their own", () => {
  assert.equal(canManageRole("admin", "team_leader"), true);
  assert.equal(canManageRole("admin", "admin"), false);
  assert.equal(canManageRole("super_admin", "admin"), true);
  assert.equal(canManageRole("team_leader", "student"), false);
});

test("member invitations and deactivation follow the same role boundary", () => {
  assert.equal(canInviteRole("admin", "student"), true);
  assert.equal(canInviteRole("admin", "admin"), false);
  assert.equal(canInviteRole("super_admin", "admin"), true);
  assert.equal(canInviteRole("super_admin", "super_admin"), false);
  assert.equal(canChangeMemberStatus("admin", "employee", false), true);
  assert.equal(canChangeMemberStatus("admin", "admin", false), false);
  assert.equal(canChangeMemberStatus("super_admin", "admin", false), true);
  assert.equal(canChangeMemberStatus("super_admin", "admin", true), false);
});

test("permissions are cumulative while Android always receives student capability", () => {
  const employee = permissionsForRole("employee");
  assert.equal(employee.has("learning.progress.write"), true);
  assert.equal(employee.has("tasks.self.manage"), true);
  const superAdmin = permissionsForRole("super_admin");
  assert.equal(superAdmin.has("learning.read"), true);
  assert.equal(superAdmin.has("system.manage"), true);
  for (const role of APP_ROLES) assert.equal(mobileEffectiveRole(role), "student");
});
