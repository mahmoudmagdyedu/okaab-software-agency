## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-10-27 - Buffer byte length comparison in timingSafeEqual signature validation
**Vulnerability:** Comparing string `.length` before calling `crypto.timingSafeEqual` allows strings with multi-byte UTF-8 characters to pass string length check but fail Buffer byte length equality, throwing an unhandled `RangeError: ERR_CRYPTO_TIMING_SAFE_EQUAL_LENGTH` in Node.js.
**Learning:** `crypto.timingSafeEqual` strictly checks Buffer byte lengths. String `.length` counts UTF-16 code units, not UTF-8 bytes.
**Prevention:** Always convert strings to `Buffer` instances first, store them in variables, and compare `bufA.length === bufB.length` before calling `crypto.timingSafeEqual(bufA, bufB)`.
