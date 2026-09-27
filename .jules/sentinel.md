## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2025-02-18 - DoS vulnerability due to string vs buffer length comparison before timingSafeEqual
**Vulnerability:** Unhandled exception DoS in YouTube Webhook signature validation.
**Learning:** When using crypto.timingSafeEqual, comparing string lengths before creating Buffers is insecure. Multi-byte characters can cause string lengths to match while buffer lengths differ, throwing an unhandled TypeError when timingSafeEqual is called.
**Prevention:** Always convert strings to Buffers first and compare the Buffer lengths before calling timingSafeEqual.
