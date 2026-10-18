import assert from "node:assert";
import { createHmac } from "node:crypto";
import { test } from "node:test";
import { validSignature } from "./webhook.ts";

test("validSignature returns true for matching HMAC signatures", () => {
  const secret = "test-secret-123";
  process.env["YOUTUBE_WEBSUB_SECRET"] = secret;
  const body = '{"video_id": "xyz"}';
  const expectedHmac = createHmac("sha1", secret).update(body).digest("hex");
  const signature = `sha1=${expectedHmac}`;

  assert.strictEqual(validSignature(body, signature), true);
});

test("validSignature returns false for mismatched signatures of equal character length", () => {
  const secret = "test-secret-123";
  process.env["YOUTUBE_WEBSUB_SECRET"] = secret;
  const body = '{"video_id": "xyz"}';
  const dummySignature = "sha1=" + "a".repeat(40);

  assert.strictEqual(validSignature(body, dummySignature), false);
});

test("validSignature returns false and does not throw RangeError on multi-byte UTF-8 input", () => {
  const secret = "test-secret-123";
  process.env["YOUTUBE_WEBSUB_SECRET"] = secret;
  const body = '{"video_id": "xyz"}';
  // 40 characters containing multi-byte UTF-8 (e.g. 20 emoji characters)
  const multibyteSignature = "sha1=" + "🔥".repeat(20);

  assert.doesNotThrow(() => {
    assert.strictEqual(validSignature(body, multibyteSignature), false);
  });
});
