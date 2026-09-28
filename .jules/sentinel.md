## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2024-05-27 - Fix DoS vulnerability in timingSafeEqual buffer comparison
**Vulnerability:** timingSafeEqual throws an error if buffer lengths differ, causing potential DoS if length checks use string length.
**Learning:** String length (e.g. multi-byte chars) is not equal to buffer byte length.
**Prevention:** Always compare buffer byte lengths before timingSafeEqual.
