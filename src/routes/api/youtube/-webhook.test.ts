import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";

import { validSignature } from "./webhook.ts";

const SECRET = "test-secret-key-123";

test("returns false when secret or signature is missing or malformed", () => {
  delete process.env["YOUTUBE_WEBSUB_SECRET"];
  assert.equal(validSignature("body", "sha1=abcdef"), false);

  process.env["YOUTUBE_WEBSUB_SECRET"] = SECRET;
  assert.equal(validSignature("body", null), false);
  assert.equal(validSignature("body", ""), false);
  assert.equal(validSignature("body", "invalid=abcdef"), false);
});

test("returns true for valid sha1 signature", () => {
  process.env["YOUTUBE_WEBSUB_SECRET"] = SECRET;
  const body = JSON.stringify({ event: "video_published", id: "123" });
  const hash = createHmac("sha1", SECRET).update(body).digest("hex");
  assert.equal(validSignature(body, `sha1=${hash}`), true);
});

test("returns false for invalid signature or mismatched length without throwing", () => {
  process.env["YOUTUBE_WEBSUB_SECRET"] = SECRET;
  const body = "hello world";
  const validHash = createHmac("sha1", SECRET).update(body).digest("hex");
  const tampered = validHash.slice(0, -1) + (validHash.endsWith("a") ? "b" : "a");
  assert.equal(validSignature(body, `sha1=${tampered}`), false);
  assert.equal(validSignature(body, "sha1=short"), false);
  assert.equal(validSignature(body, `sha1=${validHash}extra`), false);
});

test("handles multi-byte and unicode strings safely without throwing RangeError", () => {
  process.env["YOUTUBE_WEBSUB_SECRET"] = SECRET;
  const body = "hello world";
  // Create a 40-character string containing multi-byte characters
  const multiByteStr = "🔥".repeat(40); // 40 chars, 160 bytes
  assert.equal(validSignature(body, `sha1=${multiByteStr}`), false);
});
