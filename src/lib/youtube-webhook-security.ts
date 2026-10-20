import { createHmac, timingSafeEqual } from "node:crypto";

export function validSignature(
  body: string,
  signature: string | null,
  secret: string | undefined = process.env["YOUTUBE_WEBSUB_SECRET"],
) {
  if (!secret || !signature?.startsWith("sha1=")) return false;
  const expected = createHmac("sha1", secret).update(body).digest("hex");
  const supplied = signature.slice(5);

  // Security: Convert strings to Buffer objects first and compare Buffer byte lengths.
  // Calling timingSafeEqual on Buffers of differing byte lengths throws a RangeError in Node.js,
  // while comparing string.length before Buffer conversion can mismatch on multi-byte UTF-8 characters.
  const expectedBuf = Buffer.from(expected);
  const suppliedBuf = Buffer.from(supplied);

  return expectedBuf.length === suppliedBuf.length && timingSafeEqual(expectedBuf, suppliedBuf);
}
