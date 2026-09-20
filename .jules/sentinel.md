## 2024-05-24 - DoS vulnerability in timingSafeEqual string length comparison
**Vulnerability:** DoS vulnerability due to unhandled exceptions when multibyte characters were provided to `timingSafeEqual`.
**Learning:** `timingSafeEqual` should only compare the length of the instantiated `Buffer` objects, not the original strings, to avoid exceptions when multi-byte characters are provided.
**Prevention:** Always compare the length of the `Buffer` objects, rather than the original strings, before executing `timingSafeEqual`.
