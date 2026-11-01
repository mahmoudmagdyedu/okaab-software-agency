## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.
## 2026-11-01 - Prevent DoS in timingSafeEqual
**Vulnerability:** Comparing string lengths instead of Buffer byte lengths before calling `timingSafeEqual` allows attackers to send multi-byte characters, causing `Buffer.from()` to create buffers of unequal lengths, which throws an unhandled exception and crashes the application (DoS).
**Learning:** Node.js `crypto.timingSafeEqual` strictly requires instantiated buffers of identical byte lengths. Validating string lengths is insufficient because multi-byte UTF-8 characters have different string lengths versus byte lengths.
**Prevention:** Always instantiate `Buffer` objects first, then compare their `.length` properties prior to invoking `timingSafeEqual`.
