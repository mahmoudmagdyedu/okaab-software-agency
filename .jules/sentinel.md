## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-10-29 - Prevent DoS in timingSafeEqual comparisons
**Vulnerability:** Comparing string lengths instead of Buffer lengths before calling `timingSafeEqual` causes a `TypeError` when characters require multiple bytes in UTF-8, leading to unhandled exceptions and potential Denial of Service (DoS) attacks.
**Learning:** Node.js `timingSafeEqual` strictly requires input Buffers to have the exact same byte length, which may differ from the character length of the original string.
**Prevention:** Instantiate the Buffer objects first, then compare their `.length` property before calling `timingSafeEqual`.
