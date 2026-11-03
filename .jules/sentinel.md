## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-11-03 - Fix DoS vulnerability in timingSafeEqual
**Vulnerability:** Comparing string lengths instead of buffer lengths before `timingSafeEqual` can lead to an unhandled exception (DoS) if strings have different byte lengths.
**Learning:** `timingSafeEqual` strictly expects buffers of the exact same byte length.
**Prevention:** Always compare `.length` of instantiated Buffer objects before calling `timingSafeEqual`.
