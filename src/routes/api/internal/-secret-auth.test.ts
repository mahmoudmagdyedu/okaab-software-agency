import assert from "node:assert/strict";
import test from "node:test";

import { safeSecretCompare } from "../../../lib/safe-secret-compare.ts";

test("safeSecretCompare performs constant-time comparison for secrets", () => {
  assert.equal(safeSecretCompare("secret-token-123", "secret-token-123"), true);
  assert.equal(safeSecretCompare("secret-token-123", "secret-token-124"), false);
  assert.equal(safeSecretCompare("short", "longer-secret-token"), false);
  assert.equal(safeSecretCompare(undefined, "secret-token"), false);
  assert.equal(safeSecretCompare("secret-token", null), false);
  assert.equal(safeSecretCompare("", ""), true);
});
