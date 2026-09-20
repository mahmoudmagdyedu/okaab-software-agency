## 2025-05-18 - Safe Buffer length comparison in crypto.timingSafeEqual

**Vulnerability:** Comparing string `.length` before passing converted `Buffer` instances to Node.js `crypto.timingSafeEqual()` can cause an unhandled `ERR_CRYPTO_TIMING_SAFE_EQUAL_LENGTH` `RangeError` exception when inputs contain multi-byte Unicode characters (e.g. non-ASCII characters or emojis), as string character count differs from byte length.
**Learning:** `crypto.timingSafeEqual(a, b)` requires `a` and `b` to have identical byte lengths (`Buffer.length`). Checking string `.length` allows inputs with equal character counts but unequal byte counts to reach `timingSafeEqual()`, resulting in uncaught server exceptions and potential DoS vectors on webhook endpoints.
**Prevention:** Convert both strings to `Buffer` instances first (or compare byte lengths using `Buffer.byteLength()`), and compare `buffer1.length === buffer2.length` before invoking `crypto.timingSafeEqual(buffer1, buffer2)`.
