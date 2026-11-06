## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-11-06 - Prevent DoS in timingSafeEqual by comparing Buffer byte lengths
**Vulnerability:** Comparing string lengths instead of Buffer byte lengths before calling `timingSafeEqual` allows attackers to send multi-byte characters that pass the string length check but create Buffers of different lengths, causing `timingSafeEqual` to throw an unhandled exception and crash the application.
**Learning:** `timingSafeEqual` strictly requires input Buffers to have the same byte length. Multi-byte characters (like UTF-8 defaults) can cause a string's `.length` to differ from its Buffer byte length.
**Prevention:** Always instantiate Buffer objects first and compare their `.length` properties before calling `crypto.timingSafeEqual` to prevent unhandled exceptions and DoS vulnerabilities.
