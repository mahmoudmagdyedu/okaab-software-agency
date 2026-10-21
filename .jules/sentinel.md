## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-10-21 - Prevent DoS via timingSafeEqual unhandled exceptions
**Vulnerability:** Comparing string lengths before passing Buffers to `crypto.timingSafeEqual` can lead to unhandled exceptions and DoS if multi-byte characters result in different Buffer lengths but equal string lengths.
**Learning:** `timingSafeEqual` strictly requires Buffers of the exact same byte length and will throw an error otherwise, exposing the server to crashing.
**Prevention:** Always instantiate Buffers first, and compare the `length` property of the `Buffer` objects (byte length) rather than the original string lengths before calling `timingSafeEqual`.
