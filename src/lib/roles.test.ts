import assert from "node:assert/strict";
import test from "node:test";

import { APP_ROLES, canManageRole, hasMinimumRole, isAdminDashboardRole } from "./roles.ts";

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
