## 2023-10-27 - [CRITICAL] DoS via timingSafeEqual & Multi-byte Characters

**Vulnerability:** The WebSub webhook endpoint used `timingSafeEqual` after comparing the lengths of the _original strings_. If an attacker sent a signature containing multi-byte characters, the string lengths could match while the byte lengths (when converted via `Buffer.from()`) differed. This mismatch caused `timingSafeEqual` to throw an unhandled exception, resulting in a Denial of Service.
**Learning:** `crypto.timingSafeEqual` requires the two buffers to be exactly the same byte length. String length (character count) is not equivalent to byte length when multi-byte characters are present.
**Prevention:** Always convert strings to buffers first, then compare the lengths of the instantiated `Buffer` objects before calling `timingSafeEqual`. We introduced a `safeCompare` utility in `src/lib/safe-compare.ts` to encapsulate this safe checking behavior.
