## 2024-05-25 - Timing Attack Fix in Webhook Verification

**Vulnerability:** Comparing original strings for length before instantiating buffers when verifying webhook signatures with `timingSafeEqual`. An attacker could bypass the string length check by using multibyte characters and crash the node process because the buffer lengths would not match, leading to an application Denial of Service (DoS).
**Learning:** `crypto.timingSafeEqual` throws an exception if the lengths of the two buffers don't exactly match. When lengths are checked on strings instead of buffers, a multibyte character could create strings of matching length but differing byte lengths in buffers.
**Prevention:** Always convert strings to Buffers first and check `Buffer.length` before invoking `crypto.timingSafeEqual`.
