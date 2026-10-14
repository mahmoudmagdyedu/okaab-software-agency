import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";

import { validSignature } from "./webhook.ts";

test("validSignature returns true for valid signature", () => {
  process.env["YOUTUBE_WEBSUB_SECRET"] = "test-secret";
  const body = '{"test": "payload"}';
  const hmac = createHmac("sha1", "test-secret").update(body).digest("hex");
  const signature = `sha1=${hmac}`;

  assert.equal(validSignature(body, signature), true);
});

test("validSignature returns false for invalid or missing secret/signature", () => {
  process.env["YOUTUBE_WEBSUB_SECRET"] = "test-secret";
  assert.equal(validSignature("body", null), false);
  assert.equal(validSignature("body", "sha1=invalidhex"), false);
  assert.equal(validSignature("body", "md5=abcd"), false);
});

test("validSignature safely handles multi-byte UTF-8 inputs without RangeError DoS", () => {
  process.env["YOUTUBE_WEBSUB_SECRET"] = "test-secret";
  const body = '{"test": "payload"}';
  // String length 40, but contains multi-byte emojis (byte length > 40)
  const multibyteSignature = "sha1=" + "😀".repeat(20);

  // Must return false without throwing RangeError exception
  assert.equal(validSignature(body, multibyteSignature), false);
});
