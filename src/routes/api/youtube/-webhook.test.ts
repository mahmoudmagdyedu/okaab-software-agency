import { createHmac } from "node:crypto";
import { describe, expect, it, beforeEach, afterEach } from "bun:test";
import { validSignature } from "./webhook.ts";

describe("YouTube WebSub validSignature", () => {
  const originalSecret = process.env["YOUTUBE_WEBSUB_SECRET"];

  beforeEach(() => {
    process.env["YOUTUBE_WEBSUB_SECRET"] = "test-secret";
  });

  afterEach(() => {
    if (originalSecret !== undefined) {
      process.env["YOUTUBE_WEBSUB_SECRET"] = originalSecret;
    } else {
      delete process.env["YOUTUBE_WEBSUB_SECRET"];
    }
  });

  it("returns true for a valid signature", () => {
    const body = '{"feed": "youtube"}';
    const hmac = createHmac("sha1", "test-secret").update(body).digest("hex");
    const signature = `sha1=${hmac}`;

    expect(validSignature(body, signature)).toBe(true);
  });

  it("returns false for an invalid signature", () => {
    const body = '{"feed": "youtube"}';
    const signature = "sha1=" + "a".repeat(40);

    expect(validSignature(body, signature)).toBe(false);
  });

  it("returns false when secret is missing", () => {
    delete process.env["YOUTUBE_WEBSUB_SECRET"];
    const body = '{"feed": "youtube"}';
    const signature = "sha1=" + "a".repeat(40);

    expect(validSignature(body, signature)).toBe(false);
  });

  it("returns false when signature header is null or malformed", () => {
    const body = '{"feed": "youtube"}';

    expect(validSignature(body, null)).toBe(false);
    expect(validSignature(body, "invalid-prefix-sha1=1234")).toBe(false);
  });

  it("safely handles multi-byte UTF-8 input with matching string length but differing byte length", () => {
    const body = '{"feed": "youtube"}';
    // 20 multi-byte characters like '🔥' have string length 40 in UTF-16 surrogate pairs,
    // but Buffer byte length is 80 (4 bytes per emoji), matching expected string length (40 hex chars).
    const multiByteString = "🔥".repeat(20);
    const signature = `sha1=${multiByteString}`;

    // Should return false safely without throwing RangeError in timingSafeEqual
    expect(() => validSignature(body, signature)).not.toThrow();
    expect(validSignature(body, signature)).toBe(false);
  });
});
