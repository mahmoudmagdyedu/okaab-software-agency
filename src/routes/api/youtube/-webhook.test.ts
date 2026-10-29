import { createHmac } from "node:crypto";
import { describe, expect, it } from "bun:test";

import { validSignature } from "./webhook";

describe("validSignature", () => {
  const secret = "test-secret-key-12345";

  it("returns true for valid hmac-sha1 signature", () => {
    process.env["YOUTUBE_WEBSUB_SECRET"] = secret;
    const body = '{"feed": "test"}';
    const expectedHex = createHmac("sha1", secret).update(body).digest("hex");
    const signatureHeader = `sha1=${expectedHex}`;

    expect(validSignature(body, signatureHeader)).toBe(true);
  });

  it("returns false when secret is not set", () => {
    delete process.env["YOUTUBE_WEBSUB_SECRET"];
    const body = '{"feed": "test"}';

    expect(validSignature(body, "sha1=abcdef")).toBe(false);
  });

  it("returns false for missing or malformed signature header", () => {
    process.env["YOUTUBE_WEBSUB_SECRET"] = secret;
    const body = '{"feed": "test"}';

    expect(validSignature(body, null)).toBe(false);
    expect(validSignature(body, "invalid-prefix")).toBe(false);
    expect(validSignature(body, "")).toBe(false);
  });

  it("returns false when signature length mismatches expected hex length", () => {
    process.env["YOUTUBE_WEBSUB_SECRET"] = secret;
    const body = '{"feed": "test"}';

    expect(validSignature(body, "sha1=12345")).toBe(false);
  });

  it("returns false for invalid signature hex of identical length", () => {
    process.env["YOUTUBE_WEBSUB_SECRET"] = secret;
    const body = '{"feed": "test"}';
    const fakeSignature = "sha1=" + "a".repeat(40);

    expect(validSignature(body, fakeSignature)).toBe(false);
  });
});
