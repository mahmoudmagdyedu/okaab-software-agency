## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-10-29 - Safely compare Buffer lengths before crypto.timingSafeEqual

**Vulnerability:** Comparing string `.length` before converting to `Buffer` with `crypto.timingSafeEqual` can fail or expose timing differences if multi-byte characters or encoding variations exist.
**Learning:** Always instantiate `Buffer` objects first and compare their `Buffer.length` byte lengths before invoking `crypto.timingSafeEqual`.
**Prevention:** Convert both strings to `Buffer` instances first, check `expectedBuf.length === suppliedBuf.length`, and then pass the buffers to `crypto.timingSafeEqual`.
