import { createHmac } from "node:crypto";
import { describe, expect, it } from "bun:test";
import { validSignature } from "./webhook";

describe("YouTube WebSub signature verification", () => {
  const secret = "test-secret-value";
  const body = JSON.stringify({ test: "payload" });

  it("accepts valid signatures matching computed HMAC", () => {
    process.env["YOUTUBE_WEBSUB_SECRET"] = secret;
    const hmac = createHmac("sha1", secret).update(body).digest("hex");
    expect(validSignature(body, `sha1=${hmac}`)).toBe(true);
  });

  it("rejects tampered signatures of the same length", () => {
    process.env["YOUTUBE_WEBSUB_SECRET"] = secret;
    const hmac = createHmac("sha1", secret).update(body).digest("hex");
    const tampered = (hmac[0] === "0" ? "1" : "0") + hmac.slice(1);
    expect(validSignature(body, `sha1=${tampered}`)).toBe(false);
  });

  it("rejects invalid signature headers missing sha1 prefix", () => {
    process.env["YOUTUBE_WEBSUB_SECRET"] = secret;
    const hmac = createHmac("sha1", secret).update(body).digest("hex");
    expect(validSignature(body, `sha256=${hmac}`)).toBe(false);
    expect(validSignature(body, null)).toBe(false);
  });

  it("safely handles multi-byte characters of matching string length without throwing DoS exceptions", () => {
    process.env["YOUTUBE_WEBSUB_SECRET"] = secret;
    const hmac = createHmac("sha1", secret).update(body).digest("hex");
    const multiByteSignature = "sha1=" + "é".repeat(hmac.length);
    expect(() => validSignature(body, multiByteSignature)).not.toThrow();
    expect(validSignature(body, multiByteSignature)).toBe(false);
  });
});
