import { createHmac, timingSafeEqual } from "node:crypto";

export function validYouTubeSignature(body: string, signature: string | null) {
  const secret = process.env["YOUTUBE_WEBSUB_SECRET"];
  if (!secret || !signature?.startsWith("sha1=")) return false;
  const expected = createHmac("sha1", secret).update(body).digest("hex");
  const supplied = signature.slice(5);
  const expectedBuf = Buffer.from(expected, "utf8");
  const suppliedBuf = Buffer.from(supplied, "utf8");
  // Security: timingSafeEqual throws RangeError if Buffer byte lengths differ.
  // Compare byteLength (not string .length) prior to timingSafeEqual to fail securely without unhandled exceptions.
  if (expectedBuf.byteLength !== suppliedBuf.byteLength) return false;
  return timingSafeEqual(expectedBuf, suppliedBuf);
}
