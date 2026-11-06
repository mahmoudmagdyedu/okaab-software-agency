## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-11-06 - Prevent DoS from timingSafeEqual buffer length mismatch
**Vulnerability:** Comparing string lengths instead of Buffer byte lengths before calling `timingSafeEqual` allows an attacker to crash the Node.js application (DoS) by providing a string with multi-byte characters that matches the expected string length but differs in byte length.
**Learning:** `Buffer.from(string)` uses UTF-8 by default, where characters can be multiple bytes. `timingSafeEqual` requires exactly equal byte lengths and throws an unhandled exception if they differ.
**Prevention:** Always instantiate `Buffer` objects first, then compare their `.length` (byte length) properties before passing them to `timingSafeEqual`.
