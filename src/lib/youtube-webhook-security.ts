import { createHmac, timingSafeEqual } from "node:crypto";

export function validateYouTubeWebhookSignature(
  body: string,
  signature: string | null,
  secret: string | undefined = process.env["YOUTUBE_WEBSUB_SECRET"],
): boolean {
  if (!secret || !signature?.startsWith("sha1=")) return false;
  const expectedHex = createHmac("sha1", secret).update(body).digest("hex");
  const suppliedHex = signature.slice(5);

  const expectedBuf = Buffer.from(expectedHex);
  const suppliedBuf = Buffer.from(suppliedHex);

  // Security: Compare Buffer byte lengths prior to timingSafeEqual to prevent
  // timingSafeEqual from throwing an unhandled TypeError when multi-byte characters are supplied.
  if (expectedBuf.length !== suppliedBuf.length) {
    return false;
  }

  return timingSafeEqual(expectedBuf, suppliedBuf);
}
