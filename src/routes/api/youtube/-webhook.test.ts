import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";

import { validSignature } from "./webhook.js";

test("returns false when YOUTUBE_WEBSUB_SECRET is not configured", () => {
  const orig = process.env["YOUTUBE_WEBSUB_SECRET"];
  delete process.env["YOUTUBE_WEBSUB_SECRET"];
  try {
    assert.equal(validSignature("payload", "sha1=abcdef"), false);
  } finally {
    if (orig !== undefined) {
      process.env["YOUTUBE_WEBSUB_SECRET"] = orig;
    }
  }
});

test("returns false when signature header is missing or malformed", () => {
  const orig = process.env["YOUTUBE_WEBSUB_SECRET"];
  process.env["YOUTUBE_WEBSUB_SECRET"] = "test-secret";
  try {
    assert.equal(validSignature("payload", null), false);
    assert.equal(validSignature("payload", ""), false);
    assert.equal(validSignature("payload", "sha256=abcdef"), false);
    assert.equal(validSignature("payload", "invalid"), false);
  } finally {
    if (orig !== undefined) {
      process.env["YOUTUBE_WEBSUB_SECRET"] = orig;
    } else {
      delete process.env["YOUTUBE_WEBSUB_SECRET"];
    }
  }
});

test("validates valid HMAC sha1 signature correctly", () => {
  const orig = process.env["YOUTUBE_WEBSUB_SECRET"];
  const secret = "test-secret-key-123";
  process.env["YOUTUBE_WEBSUB_SECRET"] = secret;
  try {
    const body = "<feed xmlns='http://www.w3.org/2005/Atom'>test</feed>";
    const validSig = `sha1=${createHmac("sha1", secret).update(body).digest("hex")}`;
    assert.equal(validSignature(body, validSig), true);
  } finally {
    if (orig !== undefined) {
      process.env["YOUTUBE_WEBSUB_SECRET"] = orig;
    } else {
      delete process.env["YOUTUBE_WEBSUB_SECRET"];
    }
  }
});

test("rejects invalid signature without throwing", () => {
  const orig = process.env["YOUTUBE_WEBSUB_SECRET"];
  const secret = "test-secret-key-123";
  process.env["YOUTUBE_WEBSUB_SECRET"] = secret;
  try {
    const body = "<feed>content</feed>";
    const invalidSig = "sha1=0000000000000000000000000000000000000000";
    assert.equal(validSignature(body, invalidSig), false);
  } finally {
    if (orig !== undefined) {
      process.env["YOUTUBE_WEBSUB_SECRET"] = orig;
    } else {
      delete process.env["YOUTUBE_WEBSUB_SECRET"];
    }
  }
});

test("safely handles mismatched lengths and multi-byte unicode characters without throwing", () => {
  const orig = process.env["YOUTUBE_WEBSUB_SECRET"];
  const secret = "test-secret-key-123";
  process.env["YOUTUBE_WEBSUB_SECRET"] = secret;
  try {
    const body = "<feed>content</feed>";
    // String length might differ from buffer byte length when containing multi-byte characters (e.g., emojis or Arabic)
    assert.equal(validSignature(body, "sha1=short"), false);
    assert.equal(validSignature(body, `sha1=${"🌟".repeat(20)}`), false);
    assert.equal(validSignature(body, `sha1=${"العربية".repeat(6)}`), false);
  } finally {
    if (orig !== undefined) {
      process.env["YOUTUBE_WEBSUB_SECRET"] = orig;
    } else {
      delete process.env["YOUTUBE_WEBSUB_SECRET"];
    }
  }
});
