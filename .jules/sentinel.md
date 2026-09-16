## 2024-05-18 - Prevent Unhandled Exception in timingSafeEqual

**Vulnerability:** Denial of Service (DoS) via unhandled exception in `crypto.timingSafeEqual`.
**Learning:** Node.js `crypto.timingSafeEqual(a, b)` throws a `TypeError` if `a` and `b` have different byte lengths. Validating string lengths (`a.length === b.length`) before calling `Buffer.from(a)` and `Buffer.from(b)` is insufficient because a multi-byte string can have the same string length as a single-byte string but a different byte length in the Buffer.
**Prevention:** Always convert strings to Buffer objects first, then compare the `.length` property of the Buffer objects before calling `timingSafeEqual`.
