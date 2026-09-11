## 2026-09-11 - Prevent DoS in timingSafeEqual
**Vulnerability:** Comparing string lengths instead of Buffer lengths before calling `crypto.timingSafeEqual` in the YouTube webhook signature validation.
**Learning:** `crypto.timingSafeEqual` throws an unhandled exception if the two Buffers have different lengths. A multi-byte string can have the same string length as a single-byte string but a different byte length. This discrepancy can be exploited to crash the server.
**Prevention:** Always convert the strings to Buffers first and check the lengths of the Buffers before calling `timingSafeEqual`.
