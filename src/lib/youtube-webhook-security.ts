import { createHmac, timingSafeEqual } from "node:crypto";

export function validSignature(body: string, signature: string | null): boolean {
  const secret = process.env["YOUTUBE_WEBSUB_SECRET"];
  if (!secret || !signature?.startsWith("sha1=")) return false;
  const expectedBuf = Buffer.from(createHmac("sha1", secret).update(body).digest("hex"));
  const suppliedBuf = Buffer.from(signature.slice(5));
  return (
    expectedBuf.length === suppliedBuf.length &&
    timingSafeEqual(expectedBuf, suppliedBuf)
  );
}
