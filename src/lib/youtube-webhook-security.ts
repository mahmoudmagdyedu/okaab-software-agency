import { createHmac, timingSafeEqual } from "node:crypto";

export function validSignature(body: string, signature: string | null) {
  const secret = process.env["YOUTUBE_WEBSUB_SECRET"];
  if (!secret || !signature?.startsWith("sha1=")) return false;
  const expectedHex = createHmac("sha1", secret).update(body).digest("hex");
  const suppliedHex = signature.slice(5);
  const expectedBuf = Buffer.from(expectedHex, "utf8");
  const suppliedBuf = Buffer.from(suppliedHex, "utf8");
  return (
    expectedBuf.byteLength === suppliedBuf.byteLength &&
    timingSafeEqual(expectedBuf, suppliedBuf)
  );
}
