import { createHmac, timingSafeEqual } from "node:crypto";

export function validSignature(body: string, signature: string | null): boolean {
  const secret = process.env["YOUTUBE_WEBSUB_SECRET"];
  if (!secret || !signature?.startsWith("sha1=")) return false;
  const expected = createHmac("sha1", secret).update(body).digest("hex");
  const supplied = signature.slice(5);

  // Prevent DoS exception in timingSafeEqual: String length in JS counts UTF-16 code units.
  // Multi-byte UTF-8 characters in supplied signature produce Buffers with different byte lengths,
  // causing crypto.timingSafeEqual to throw an unhandled RangeError/TypeError.
  const bExpected = Buffer.from(expected);
  const bSupplied = Buffer.from(supplied);

  return (
    bExpected.byteLength === bSupplied.byteLength &&
    timingSafeEqual(bExpected, bSupplied)
  );
}
