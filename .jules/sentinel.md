## 2025-05-18 - Buffer Length Verification for `crypto.timingSafeEqual`

**Vulnerability:** Comparing string lengths (`expected.length === supplied.length`) before calling `crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(supplied))` allows multi-byte UTF-8 inputs (where string length matches but byte length differs) to trigger an uncaught `RangeError: Input buffers must have the same length`, causing an unhandled server error (DoS).

**Learning:** `String.prototype.length` returns UTF-16 code unit length, while `Buffer.from(string)` calculates byte length in UTF-8. Multi-byte sequences cause `Buffer` byte lengths to diverge from string character lengths.

**Prevention:** Always instantiate `Buffer` objects first and compare `bufA.length === bufB.length` before passing them to `crypto.timingSafeEqual`.
