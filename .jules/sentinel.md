## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-11-06 - Prevent timing attacks and DoS with timingSafeEqual
**Vulnerability:** Comparing string lengths instead of Buffer lengths before calling `timingSafeEqual` can lead to unhandled runtime exceptions (DoS) and timing attacks if multi-byte characters are used.
**Learning:** When using `crypto.timingSafeEqual`, you must always compare the lengths of the instantiated `Buffer` objects instead of the original strings to ensure byte length equality.
**Prevention:** Instantiate Buffers first, store them in variables, and compare their `.length` properties prior to calling `timingSafeEqual`.
