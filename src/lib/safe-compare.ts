import { timingSafeEqual } from "node:crypto";

/**
 * Securely compares two secret strings in constant time to prevent timing attacks.
 * Compares Buffer byte lengths before calling timingSafeEqual to avoid unhandled exceptions.
 */
export function safeCompare(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}
