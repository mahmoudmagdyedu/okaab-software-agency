import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import { validSignature } from "./webhook.js";

const secret = "test-secret-value-12345";

test("accepts valid sha1 signature", () => {
  process.env["YOUTUBE_WEBSUB_SECRET"] = secret;
  const body = "hello world payload";
  const expected = createHmac("sha1", secret).update(body).digest("hex");
  const signature = `sha1=${expected}`;

  assert.equal(validSignature(body, signature), true);
});

test("rejects invalid signature with matching string length", () => {
  process.env["YOUTUBE_WEBSUB_SECRET"] = secret;
  const body = "hello world payload";
  const signature = `sha1=${"0".repeat(40)}`;

  assert.equal(validSignature(body, signature), false);
});

test("rejects mismatched length signature without throwing RangeError", () => {
  process.env["YOUTUBE_WEBSUB_SECRET"] = secret;
  const body = "hello world payload";
  const signature = "sha1=invalid";

  assert.equal(validSignature(body, signature), false);
});

test("rejects signature where string length matches expected hex length but byte length differs", () => {
  process.env["YOUTUBE_WEBSUB_SECRET"] = secret;
  const body = "hello world payload";
  // sha1 hex digest is 40 characters (40 bytes).
  // A string of 40 multi-byte characters will have 40 string length, but > 40 Buffer length.
  const multiByteString = "é".repeat(40);
  assert.equal(multiByteString.length, 40);
  assert.notEqual(Buffer.from(multiByteString).length, 40);

  const signature = `sha1=${multiByteString}`;
  // Must not throw RangeError and safely return false
  assert.equal(validSignature(body, signature), false);
});

test("rejects null or missing signature prefix", () => {
  process.env["YOUTUBE_WEBSUB_SECRET"] = secret;
  const body = "hello world payload";

  assert.equal(validSignature(body, null), false);
  assert.equal(validSignature(body, "invalid-prefix"), false);
});
