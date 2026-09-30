## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2024-05-19 - Prevent Unhandled Exceptions in timingSafeEqual
**Vulnerability:** Comparing string lengths before calling `timingSafeEqual` with `Buffer.from()` can lead to unhandled exceptions if the strings contain multi-byte characters (causing differing buffer lengths). This can be exploited for Denial of Service (DoS).
**Learning:** Always compare the byte length of the instantiated Buffer objects (not the original strings) prior to calling `timingSafeEqual`.
**Prevention:** Instantiate the buffers first, e.g., `const expectedBuf = Buffer.from(expected); const suppliedBuf = Buffer.from(supplied);`, and then verify `expectedBuf.length === suppliedBuf.length` before comparison.
