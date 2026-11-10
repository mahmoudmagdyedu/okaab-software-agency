## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-11-10 - Prevent DoS from unhandled Buffer length errors in timingSafeEqual
**Vulnerability:** Comparing string lengths before passing `Buffer` objects to `crypto.timingSafeEqual` can lead to unhandled exceptions (DoS) when multi-byte characters are supplied, because string length may match while byte length differs.
**Learning:** Always instantiate `Buffer` objects first, and compare their `.length` properties before using `timingSafeEqual` to avoid application crashes on malformed input.
**Prevention:** Ensure buffer lengths are compared prior to checking equality.
