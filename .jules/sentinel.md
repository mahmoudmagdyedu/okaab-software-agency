## 2024-05-24 - DoS Vulnerability in timingSafeEqual Buffer Creation
**Vulnerability:** Comparing string lengths before instantiating buffers for `crypto.timingSafeEqual` can lead to unhandled exceptions and Denial of Service (DoS) if strings contain multi-byte characters.
**Learning:** `Buffer.from(str).length` is not always equal to `str.length` due to multi-byte characters. `timingSafeEqual` requires buffers to be the exact same byte length.
**Prevention:** Always convert strings to buffers *first*, then compare the buffer lengths, before calling `timingSafeEqual`.
