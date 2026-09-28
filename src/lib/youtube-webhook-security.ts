import { createHmac, timingSafeEqual } from "node:crypto";

export function validSignature(body: string, signature: string | null) {
  const secret = process.env["YOUTUBE_WEBSUB_SECRET"];
  if (!secret || !signature?.startsWith("sha1=")) return false;
  const expected = createHmac("sha1", secret).update(body).digest("hex");
  const supplied = signature.slice(5);
  const bufExpected = Buffer.from(expected);
  const bufSupplied = Buffer.from(supplied);
  // Compare Buffer byte lengths before timingSafeEqual to prevent RangeError with multi-byte strings
  return (
    bufExpected.byteLength === bufSupplied.byteLength && timingSafeEqual(bufExpected, bufSupplied)
  );
}
