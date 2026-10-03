import assert from "node:assert/strict";
import test from "node:test";

import { sanitizeLikePattern } from "./sql-like.ts";

test("sanitizeLikePattern escapes MS SQL Server LIKE wildcards correctly", () => {
  // Test escaping brackets '[' -> '[[]'
  assert.equal(sanitizeLikePattern("user[name]"), "user[[]name]");

  // Test escaping wildcards '%' and '_'
  assert.equal(sanitizeLikePattern("100%_discount"), "100[%][_]discount");

  // Test combined wildcard escaping
  assert.equal(sanitizeLikePattern("%admin_[test]%"), "[%]admin[_][[]test][%]");

  // Test normal string without wildcards remains unchanged
  assert.equal(sanitizeLikePattern("regular_search"), "regular[_]search");
  assert.equal(sanitizeLikePattern("hello world"), "hello world");
});
