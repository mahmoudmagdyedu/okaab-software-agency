import { strictEqual } from "node:assert";
import { createHmac } from "node:crypto";
import test from "node:test";

import { validSignature } from "./webhook.ts";

test("validSignature returns true for valid HMAC signature", () => {
  process.env["YOUTUBE_WEBSUB_SECRET"] = "super-secret-key";
  const body = JSON.stringify({ videoId: "xyz123" });
  const hmac = createHmac("sha1", "super-secret-key").update(body).digest("hex");
  const result = validSignature(body, `sha1=${hmac}`);
  strictEqual(result, true);
});

test("validSignature returns false safely when signature length or encoding differs", () => {
  process.env["YOUTUBE_WEBSUB_SECRET"] = "super-secret-key";
  const body = JSON.stringify({ videoId: "xyz123" });
  // Missing prefix
  strictEqual(validSignature(body, "invalid"), false);
  // Different length
  strictEqual(validSignature(body, "sha1=short"), false);
  // Multi-byte or non-hex characters with same string length
  const fakeSig = "sha1=" + "✨".repeat(20);
  strictEqual(validSignature(body, fakeSig), false);
});
