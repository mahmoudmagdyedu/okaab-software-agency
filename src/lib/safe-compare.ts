import { timingSafeEqual } from "node:crypto";

export function safeCompare(
  expected: string | undefined | null,
  supplied: string | undefined | null,
): boolean {
  if (typeof expected !== "string" || typeof supplied !== "string") return false;
  const expectedBuffer = Buffer.from(expected);
  const suppliedBuffer = Buffer.from(supplied);
  return (
    expectedBuffer.length === suppliedBuffer.length &&
    timingSafeEqual(expectedBuffer, suppliedBuffer)
  );
}
