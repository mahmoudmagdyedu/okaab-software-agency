## 2024-05-15 - [timingSafeEqual DoS Vulnerability]
**Vulnerability:** Denial of Service (DoS) vulnerability via `crypto.timingSafeEqual` unhandled exception when string length matches but byte length differs.
**Learning:** Comparing lengths of strings before converting them to Buffers in Node.js can be bypassed with multi-byte characters (e.g., 'ñ'), leading to `timingSafeEqual` throwing an "Input buffers must have the same byte length" error.
**Prevention:** Always convert strings to `Buffer` objects first, and then compare the `length` property of the `Buffer` objects before calling `timingSafeEqual`.
