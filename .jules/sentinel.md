## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-10-18 - [timingSafeEqual Timing Attack and DoS Vulnerability]
**Vulnerability:** Comparing original string lengths before invoking `timingSafeEqual` with `Buffer.from` can lead to Unhandled exceptions, Timing attacks, or DoS vulnerabilities when dealing with multi-byte characters.
**Learning:** Node.js `timingSafeEqual` strictly expects the lengths of the instantiated `Buffer` objects to be identical. Using original string `.length` before buffer conversion does not guarantee identical buffer lengths because multi-byte characters could make a buffer longer than its string length.
**Prevention:** Always compare `.length` of instantiated `Buffer` objects instead of string `.length` before passing them to `timingSafeEqual`.
