import { createHmac } from "node:crypto";
import assert from "node:assert/strict";
import test from "node:test";

import { validSignature } from "./youtube-webhook-security.ts";

test("returns false if YOUTUBE_WEBSUB_SECRET is missing", () => {
  assert.equal(validSignature("test-body", "sha1=abcd", undefined), false);
});

test("returns false if signature does not start with sha1=", () => {
  assert.equal(validSignature("test-body", "md5=abcd", "secret123"), false);
  assert.equal(validSignature("test-body", null, "secret123"), false);
});

test("returns true for matching signature", () => {
  const secret = "secret123";
  const body = "hello world";

  const expected = createHmac("sha1", secret).update(body).digest("hex");
  assert.equal(validSignature(body, `sha1=${expected}`, secret), true);
});

test("safely handles signature byte length mismatches including multi-byte UTF-8 without throwing", () => {
  const secret = "secret123";

  // Different lengths
  assert.equal(validSignature("hello", "sha1=short", secret), false);
  // Multi-byte UTF-8 character signature mismatch
  assert.equal(validSignature("hello", "sha1=🌟🌟🌟", secret), false);
});
