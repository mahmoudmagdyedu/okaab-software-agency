import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";

import { validSignature } from "./webhook.ts";

test("validSignature accepts a valid HMAC signature", () => {
  const originalSecret = process.env["YOUTUBE_WEBSUB_SECRET"];
  process.env["YOUTUBE_WEBSUB_SECRET"] = "test-secret";
  try {
    const body = "hello world";
    const expectedHex = createHmac("sha1", "test-secret").update(body).digest("hex");
    const header = `sha1=${expectedHex}`;

    assert.equal(validSignature(body, header), true);
  } finally {
    if (originalSecret === undefined) {
      delete process.env["YOUTUBE_WEBSUB_SECRET"];
    } else {
      process.env["YOUTUBE_WEBSUB_SECRET"] = originalSecret;
    }
  }
});

test("validSignature rejects null or malformed signature headers", () => {
  const originalSecret = process.env["YOUTUBE_WEBSUB_SECRET"];
  process.env["YOUTUBE_WEBSUB_SECRET"] = "test-secret";
  try {
    assert.equal(validSignature("body", null), false);
    assert.equal(validSignature("body", "invalid-header"), false);
    assert.equal(validSignature("body", "sha256=abcdef"), false);
  } finally {
    if (originalSecret === undefined) {
      delete process.env["YOUTUBE_WEBSUB_SECRET"];
    } else {
      process.env["YOUTUBE_WEBSUB_SECRET"] = originalSecret;
    }
  }
});

test("validSignature rejects signature with incorrect hex content", () => {
  const originalSecret = process.env["YOUTUBE_WEBSUB_SECRET"];
  process.env["YOUTUBE_WEBSUB_SECRET"] = "test-secret";
  try {
    const body = "hello world";
    const fakeHex = "a".repeat(40);
    assert.equal(validSignature(body, `sha1=${fakeHex}`), false);
  } finally {
    if (originalSecret === undefined) {
      delete process.env["YOUTUBE_WEBSUB_SECRET"];
    } else {
      process.env["YOUTUBE_WEBSUB_SECRET"] = originalSecret;
    }
  }
});

test("validSignature handles multi-byte utf-8 signatures with matching string length without throwing", () => {
  const originalSecret = process.env["YOUTUBE_WEBSUB_SECRET"];
  process.env["YOUTUBE_WEBSUB_SECRET"] = "test-secret";
  try {
    const body = "hello world";
    // 40 multi-byte characters ('ع' is 2 bytes in UTF-8, so 80 bytes total Buffer byte length)
    // String length is 40, matching the expected digest hex string length of 40.
    const multiByte40Chars = "ع".repeat(40);
    assert.equal(multiByte40Chars.length, 40);
    assert.equal(Buffer.from(multiByte40Chars).length, 80);

    // Should return false safely without throwing TypeError from timingSafeEqual
    assert.doesNotThrow(() => {
      const result = validSignature(body, `sha1=${multiByte40Chars}`);
      assert.equal(result, false);
    });
  } finally {
    if (originalSecret === undefined) {
      delete process.env["YOUTUBE_WEBSUB_SECRET"];
    } else {
      process.env["YOUTUBE_WEBSUB_SECRET"] = originalSecret;
    }
  }
});
