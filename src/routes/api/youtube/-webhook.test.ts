import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";

import { validSignature } from "./webhook.ts";

const testSecret = "test-youtube-websub-secret-key";

test("validSignature accepts valid HMAC SHA-1 signature", () => {
  const originalSecret = process.env["YOUTUBE_WEBSUB_SECRET"];
  try {
    process.env["YOUTUBE_WEBSUB_SECRET"] = testSecret;
    const body = JSON.stringify({ test: "payload", id: 123 });
    const expected = createHmac("sha1", testSecret).update(body).digest("hex");
    const signature = `sha1=${expected}`;

    assert.equal(validSignature(body, signature), true);
  } finally {
    process.env["YOUTUBE_WEBSUB_SECRET"] = originalSecret;
  }
});

test("validSignature safely handles multi-byte signatures without throwing RangeError", () => {
  const originalSecret = process.env["YOUTUBE_WEBSUB_SECRET"];
  try {
    process.env["YOUTUBE_WEBSUB_SECRET"] = testSecret;
    const body = "sample notification body";
    // A 40-character string composed of multi-byte characters (each 3 bytes in UTF-8)
    const multiByteString = "✓".repeat(40);
    const signature = `sha1=${multiByteString}`;

    // Must return false cleanly without throwing RangeError from crypto.timingSafeEqual
    assert.doesNotThrow(() => {
      const result = validSignature(body, signature);
      assert.equal(result, false);
    });
  } finally {
    process.env["YOUTUBE_WEBSUB_SECRET"] = originalSecret;
  }
});

test("validSignature rejects signatures with invalid hex digest of equal byte length", () => {
  const originalSecret = process.env["YOUTUBE_WEBSUB_SECRET"];
  try {
    process.env["YOUTUBE_WEBSUB_SECRET"] = testSecret;
    const body = "sample notification body";
    const signature = "sha1=" + "a".repeat(40);

    assert.equal(validSignature(body, signature), false);
  } finally {
    process.env["YOUTUBE_WEBSUB_SECRET"] = originalSecret;
  }
});

test("validSignature returns false when secret is missing or signature format is invalid", () => {
  const originalSecret = process.env["YOUTUBE_WEBSUB_SECRET"];
  try {
    delete process.env["YOUTUBE_WEBSUB_SECRET"];
    assert.equal(validSignature("body", "sha1=abcdef"), false);

    process.env["YOUTUBE_WEBSUB_SECRET"] = testSecret;
    assert.equal(validSignature("body", null), false);
    assert.equal(validSignature("body", "invalid-format"), false);
    assert.equal(validSignature("body", "sha256=abcdef"), false);
  } finally {
    process.env["YOUTUBE_WEBSUB_SECRET"] = originalSecret;
  }
});
