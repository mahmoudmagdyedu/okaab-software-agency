import { createHmac } from "node:crypto";
import { describe, expect, it } from "bun:test";

import { validSignature } from "./webhook";

describe("YouTube Webhook signature validation", () => {
  const secret = "test_secret_key_12345";

  it("returns false if process.env.YOUTUBE_WEBSUB_SECRET is not set or signature is invalid", () => {
    delete process.env["YOUTUBE_WEBSUB_SECRET"];
    expect(validSignature("hello", "sha1=1234")).toBe(false);

    process.env["YOUTUBE_WEBSUB_SECRET"] = secret;
    expect(validSignature("hello", null)).toBe(false);
    expect(validSignature("hello", "invalid_format")).toBe(false);
  });

  it("validates correct HMAC signatures", () => {
    process.env["YOUTUBE_WEBSUB_SECRET"] = secret;
    const body = "test_webhook_body";
    const hmac = createHmac("sha1", secret).update(body).digest("hex");
    expect(validSignature(body, `sha1=${hmac}`)).toBe(true);
  });

  it("safely handles signature mismatch and length mismatch without throwing", () => {
    process.env["YOUTUBE_WEBSUB_SECRET"] = secret;
    const body = "test_webhook_body";

    // Different length
    expect(validSignature(body, "sha1=short")).toBe(false);

    // Multi-byte / special characters in signature
    expect(validSignature(body, "sha1=🚀✨invalid_multibyte_signature")).toBe(false);

    // Same length, wrong signature
    const fakeSignature = "0".repeat(40);
    expect(validSignature(body, `sha1=${fakeSignature}`)).toBe(false);
  });
});
