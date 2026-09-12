import { createHmac, timingSafeEqual } from "node:crypto";

export function validateWebSubSignature(
  body: string,
  signature: string | null,
  secret = process.env["YOUTUBE_WEBSUB_SECRET"],
): boolean {
  if (!secret || !signature?.startsWith("sha1=")) return false;
  const expected = createHmac("sha1", secret).update(body).digest("hex");
  const supplied = signature.slice(5);
  const bufExpected = Buffer.from(expected);
  const bufSupplied = Buffer.from(supplied);
  return (
    bufExpected.length === bufSupplied.length &&
    timingSafeEqual(bufExpected, bufSupplied)
  );
}
