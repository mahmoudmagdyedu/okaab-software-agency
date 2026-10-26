## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-10-26 - Prevent DoS in timingSafeEqual via Buffer Length Validation
**Vulnerability:** Unauthenticated DoS via unhandled exception in `timingSafeEqual` when comparing signatures containing multi-byte characters.
**Learning:** Checking string length before converting to Buffer is insufficient because multi-byte characters can result in different byte lengths for strings of the same character length. `crypto.timingSafeEqual` requires Buffers of exactly the same byte length, otherwise it throws an unhandled exception.
**Prevention:** Always convert strings to Buffers first, and then compare the `.length` property of the Buffer objects before calling `timingSafeEqual`.
