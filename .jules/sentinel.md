## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-11-11 - Prevent DoS in timingSafeEqual by comparing Buffer lengths
**Vulnerability:** Comparing string lengths instead of Buffer lengths before passing them to `crypto.timingSafeEqual` can lead to unhandled runtime exceptions (Denial of Service) when an attacker provides a string with multi-byte characters that matches the expected string length but results in a different byte length.
**Learning:** Node.js `timingSafeEqual` throws an exception if the two `Buffer` objects do not have the same byte length.
**Prevention:** Always instantiate `Buffer` objects first and compare their `.length` properties before calling `timingSafeEqual`.
