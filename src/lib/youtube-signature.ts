import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Validates the YouTube WebSub HMAC-SHA1 signature.
 *
 * Security Note:
 * Buffer byte length comparison (expectedBuf.length === suppliedBuf.length) must be performed
 * prior to calling crypto.timingSafeEqual to prevent unhandled TypeError exceptions when inputs
 * contain multi-byte UTF-8 characters. In JavaScript, String#length counts UTF-16 code units,
 * which can differ from UTF-8 byte length, creating a potential Denial of Service (DoS) vulnerability.
 */
export function validSignature(body: string, signature: string | null): boolean {
  const secret = process.env["YOUTUBE_WEBSUB_SECRET"];
  if (!secret || !signature?.startsWith("sha1=")) return false;

  const expected = createHmac("sha1", secret).update(body).digest("hex");
  const supplied = signature.slice(5);

  const expectedBuf = Buffer.from(expected);
  const suppliedBuf = Buffer.from(supplied);

  // Compare byte lengths of Buffer objects to prevent timingSafeEqual from throwing
  // RangeError/TypeError on mismatched byte lengths from multi-byte characters.
  return expectedBuf.length === suppliedBuf.length && timingSafeEqual(expectedBuf, suppliedBuf);
}
