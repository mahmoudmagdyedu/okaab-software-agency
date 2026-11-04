import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import { validSignature } from "./webhook.js";

const TEST_SECRET = "test-webhook-secret-key-12345";

test("validSignature verifies authentic webhook payloads", () => {
  process.env["YOUTUBE_WEBSUB_SECRET"] = TEST_SECRET;
  const body = JSON.stringify({ event: "video_published", id: "123" });
  const hmac = createHmac("sha1", TEST_SECRET).update(body).digest("hex");
  const signature = `sha1=${hmac}`;

  assert.equal(validSignature(body, signature), true);
});

test("validSignature rejects invalid or missing signatures", () => {
  process.env["YOUTUBE_WEBSUB_SECRET"] = TEST_SECRET;
  const body = JSON.stringify({ event: "video_published", id: "123" });

  assert.equal(validSignature(body, null), false);
  assert.equal(validSignature(body, "invalid"), false);
  assert.equal(validSignature(body, "sha1=wronghash12345"), false);
  assert.equal(validSignature(body, "sha1=" + "a".repeat(40)), false);
});

test("validSignature safely rejects multi-byte mismatched signatures without throwing RangeError", () => {
  process.env["YOUTUBE_WEBSUB_SECRET"] = TEST_SECRET;
  const body = JSON.stringify({ event: "video_published", id: "123" });
  const hmac = createHmac("sha1", TEST_SECRET).update(body).digest("hex");

  // Construct a signature where string length matches 40 chars, but Buffer byte length differs due to multi-byte characters
  const malformed = "a".repeat(38) + "é"; // 39 chars in string length, but byte length may vary, or 40 code units
  assert.equal(malformed.length, 39);

  const exactStringLengthMalformed = "a".repeat(39) + "é"; // 40 characters in string length, 41 bytes in UTF-8
  assert.equal(exactStringLengthMalformed.length, 40);
  assert.equal(Buffer.from(exactStringLengthMalformed).length, 41);
  assert.equal(Buffer.from(hmac).length, 40);

  // Calling validSignature must not throw ERR_CRYPTO_TIMING_SAFE_EQUAL_LENGTH
  assert.doesNotThrow(() => {
    const result = validSignature(body, `sha1=${exactStringLengthMalformed}`);
    assert.equal(result, false);
  });
});
