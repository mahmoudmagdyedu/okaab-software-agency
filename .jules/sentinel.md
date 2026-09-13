## 2024-09-13 - [crypto.timingSafeEqual DoS via Unhandled Exceptions]
**Vulnerability:** Unhandled `Error: Input buffers must have the same byte length` in `crypto.timingSafeEqual`.
**Learning:** Checking string lengths (`expected.length === supplied.length`) does not guarantee `Buffer.from(expected).length === Buffer.from(supplied).length` if multi-byte characters are provided. This throws an unhandled exception crashing the process.
**Prevention:** Compare lengths of instantiated `Buffer` objects instead of string lengths prior to passing them to `timingSafeEqual`.
