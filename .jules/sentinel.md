## 2026-09-12 - Prevent DoS via `crypto.timingSafeEqual` Buffer length mismatch

**Vulnerability:** Deninal of Service (DoS) vulnerability via unhandled exception in `crypto.timingSafeEqual`. The API webhook signature validation compared string lengths rather than Buffer byte lengths prior to `timingSafeEqual`.
**Learning:** `crypto.timingSafeEqual` throws a `RangeError` if the two `Buffer` objects do not have the same byte length. Multi-byte characters can cause two strings to have the same string length, but different resulting Buffer byte lengths.
**Prevention:** Always compare the `length` property of the instantiated `Buffer` objects, not the original strings, before passing them to `timingSafeEqual`.
