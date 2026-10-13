import { timingSafeEqual } from "node:crypto";

/**
 * Safely compares two secret strings in constant time to prevent timing side-channel attacks.
 */
export function safeSecretCompare(
  a: string | null | undefined,
  b: string | null | undefined,
): boolean {
  if (typeof a !== "string" || typeof b !== "string") {
    return false;
  }

  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);

  if (bufA.length !== bufB.length) {
    return false;
  }

  return timingSafeEqual(bufA, bufB);
}
