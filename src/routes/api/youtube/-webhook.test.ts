import { describe, expect, test } from "bun:test";
import { createHmac } from "node:crypto";
import { validSignature } from "./webhook";

describe("validSignature", () => {
  const secret = "test-secret-key-12345";

  test("accepts valid sha1 signature", () => {
    process.env["YOUTUBE_WEBSUB_SECRET"] = secret;
    const body = "sample-youtube-feed-content";
    const digest = createHmac("sha1", secret).update(body).digest("hex");
    const signature = `sha1=${digest}`;

    expect(validSignature(body, signature)).toBe(true);
  });

  test("rejects when secret is not configured", () => {
    delete process.env["YOUTUBE_WEBSUB_SECRET"];
    const body = "sample-youtube-feed-content";
    const signature = "sha1=abcdef1234567890";

    expect(validSignature(body, signature)).toBe(false);
  });

  test("rejects null or missing signature prefix", () => {
    process.env["YOUTUBE_WEBSUB_SECRET"] = secret;
    const body = "sample-youtube-feed-content";

    expect(validSignature(body, null)).toBe(false);
    expect(validSignature(body, "invalid-prefix")).toBe(false);
  });

  test("rejects invalid signature with different length safely without throwing", () => {
    process.env["YOUTUBE_WEBSUB_SECRET"] = secret;
    const body = "sample-youtube-feed-content";

    expect(validSignature(body, "sha1=short")).toBe(false);
  });

  test("rejects signature with matching string length but different byte length (multi-byte unicode) without throwing", () => {
    process.env["YOUTUBE_WEBSUB_SECRET"] = secret;
    const body = "sample-youtube-feed-content";
    const digest = createHmac("sha1", secret).update(body).digest("hex");

    // 40 unicode emoji characters (e.g., '🛡' or fullwidth characters)
    // String.length is 40 (or 80 if surrogate pairs), but Buffer.from(unicode).length is much larger
    const multiByteString = "🛡️".repeat(20).slice(0, digest.length);
    const signature = `sha1=${multiByteString}`;

    expect(() => validSignature(body, signature)).not.toThrow();
    expect(validSignature(body, signature)).toBe(false);
  });

  test("rejects mismatched signature of identical buffer length safely", () => {
    process.env["YOUTUBE_WEBSUB_SECRET"] = secret;
    const body = "sample-youtube-feed-content";
    const digest = createHmac("sha1", secret).update(body).digest("hex");
    // Change last character
    const tampered = digest.slice(0, -1) + (digest.endsWith("a") ? "b" : "a");

    expect(validSignature(body, `sha1=${tampered}`)).toBe(false);
  });
});
