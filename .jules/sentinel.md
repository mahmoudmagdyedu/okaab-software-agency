## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-11-08 - Prevent DoS in timingSafeEqual by comparing Buffer byte lengths
**Vulnerability:** Comparing string lengths before passing strings to `Buffer.from()` and `crypto.timingSafeEqual()` can cause runtime exceptions (DoS) if user input contains multi-byte characters, leading to mismatched buffer lengths.
**Learning:** Always instantiate `Buffer` objects first and compare their `.length` properties (byte lengths) before passing them to `timingSafeEqual` to avoid unhandled exceptions and timing attacks when handling multi-byte characters.
**Prevention:** Ensure Buffer byte lengths are compared prior to `timingSafeEqual`.
