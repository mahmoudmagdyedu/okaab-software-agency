import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";

import { validSignature } from "../../../lib/youtube-webhook-security.ts";

test("validSignature returns false when secret is missing or signature format is invalid", () => {
  const originalSecret = process.env["YOUTUBE_WEBSUB_SECRET"];
  delete process.env["YOUTUBE_WEBSUB_SECRET"];
  assert.equal(validSignature("hello", "sha1=abcd"), false);

  process.env["YOUTUBE_WEBSUB_SECRET"] = "secret_key_123";
  assert.equal(validSignature("hello", null), false);
  assert.equal(validSignature("hello", "invalid_prefix"), false);

  process.env["YOUTUBE_WEBSUB_SECRET"] = originalSecret;
});

test("validSignature returns true for valid HMAC signature", () => {
  const originalSecret = process.env["YOUTUBE_WEBSUB_SECRET"];
  const secret = "secret_key_123";
  process.env["YOUTUBE_WEBSUB_SECRET"] = secret;
  const body = "sample body content";
  const expectedHmac = createHmac("sha1", secret).update(body).digest("hex");

  assert.equal(validSignature(body, `sha1=${expectedHmac}`), true);

  process.env["YOUTUBE_WEBSUB_SECRET"] = originalSecret;
});

test("validSignature safely returns false without RangeError on multi-byte or mismatched strings", () => {
  const originalSecret = process.env["YOUTUBE_WEBSUB_SECRET"];
  const secret = "secret_key_123";
  process.env["YOUTUBE_WEBSUB_SECRET"] = secret;
  const body = "sample body content";

  // Mismatched length hex string
  assert.equal(validSignature(body, "sha1=12345"), false);

  // String with multi-byte UTF-8 characters where string length === hex length (40 chars)
  // but byte length differs
  const multiByteStr = "🔒".repeat(40);
  assert.doesNotThrow(() => {
    const result = validSignature(body, `sha1=${multiByteStr}`);
    assert.equal(result, false);
  });

  process.env["YOUTUBE_WEBSUB_SECRET"] = originalSecret;
});
