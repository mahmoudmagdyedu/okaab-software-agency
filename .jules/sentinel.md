## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2024-05-19 - Prevent DoS in Node.js timingSafeEqual
**Vulnerability:** Comparing string lengths instead of Buffer byte lengths prior to `crypto.timingSafeEqual` can lead to unhandled exceptions (DoS) when multi-byte characters are used.
**Learning:** `timingSafeEqual` throws an error if the two Buffers have different byte lengths.
**Prevention:** Always compare the byte length of the instantiated `Buffer` objects, not the original strings.
**Action:** Implemented Buffer byte length comparison before `timingSafeEqual`.
