import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { safeCompare } from "./safe-compare.ts";

describe("safeCompare", () => {
  it("returns true for matching strings", () => {
    assert.equal(safeCompare("secret123", "secret123"), true);
  });

  it("returns false for non-matching strings of same length", () => {
    assert.equal(safeCompare("secret123", "secret124"), false);
  });

  it("returns false for non-matching strings of different length", () => {
    assert.equal(safeCompare("secret123", "secret1234"), false);
  });

  it("handles empty strings", () => {
    assert.equal(safeCompare("", ""), true);
    assert.equal(safeCompare("", "a"), false);
  });

  it("handles multi-byte unicode characters safely", () => {
    assert.equal(safeCompare("🔑secret", "🔑secret"), true);
    assert.equal(safeCompare("🔑secret", "🔒secret"), false);
  });

  it("returns false if non-string values are passed", () => {
    // @ts-expect-error test non-string input
    assert.equal(safeCompare(null, "secret"), false);
    // @ts-expect-error test non-string input
    assert.equal(safeCompare("secret", undefined), false);
  });
});
