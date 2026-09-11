import assert from "node:assert/strict";
import test from "node:test";

import { buildInvitationRedirectUrl } from "./invitation-url.ts";

test("student invitations are accepted through sign-up before the learner dashboard", () => {
  const url = new URL(buildInvitationRedirectUrl("student"));
  assert.equal(url.origin, "https://okaab.org");
  assert.equal(url.pathname, "/sign-up");
  assert.equal(url.searchParams.get("redirect_url"), "https://okaab.org/dashboard");
});

test("staff invitations are accepted through sign-up before the admin dashboard", () => {
  for (const role of ["employee", "team_leader", "admin"] as const) {
    const url = new URL(buildInvitationRedirectUrl(role));
    assert.equal(url.pathname, "/sign-up");
    assert.equal(url.searchParams.get("redirect_url"), "https://okaab.org/admin");
  }
});
