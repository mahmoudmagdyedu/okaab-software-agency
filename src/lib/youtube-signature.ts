import { createHmac, timingSafeEqual } from "node:crypto";

export function validSignature(body: string, signature: string | null): boolean {
  const secret = process.env["YOUTUBE_WEBSUB_SECRET"];
  if (!secret || !signature?.startsWith("sha1=")) return false;
  const expected = createHmac("sha1", secret).update(body).digest("hex");
  const supplied = signature.slice(5);
  const expectedBuf = Buffer.from(expected);
  const suppliedBuf = Buffer.from(supplied);
  return (
    expectedBuf.length === suppliedBuf.length &&
    timingSafeEqual(expectedBuf, suppliedBuf)
  );
}
