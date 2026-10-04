import assert from "node:assert/strict";
import test from "node:test";

import { escapeLikeWildcards } from "./sql-like-sanitizer.ts";

test("escapeLikeWildcards escapes MS SQL wildcards in correct order", () => {
  assert.equal(escapeLikeWildcards("test%user"), "test[%]user");
  assert.equal(escapeLikeWildcards("user_name"), "user[_]name");
  assert.equal(escapeLikeWildcards("[admin]"), "[[]admin]");
  assert.equal(escapeLikeWildcards("100%_user[test]"), "100[%][_]user[[]test]");
});
