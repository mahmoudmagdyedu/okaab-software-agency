## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.
## 2026-10-21 - [DoS via timingSafeEqual exception]
**Vulnerability:** Comparing string lengths instead of Buffer lengths before `crypto.timingSafeEqual`.
**Learning:** Multi-byte characters in utf-8 defaults cause Buffer byte lengths to differ from string lengths. Passing different length Buffers to `timingSafeEqual` throws a runtime exception, allowing unauthenticated DoS.
**Prevention:** Always compare `.length` properties of instantiated `Buffer` objects, not the original strings, before calling `timingSafeEqual`.
