## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-10-15 - Prevent DoS from timingSafeEqual Buffer length mismatch
**Vulnerability:** Calling `timingSafeEqual` with Buffers of different lengths throws an unhandled exception, leading to Denial of Service (DoS) when processing malicious user input that matches character length but not byte length.
**Learning:** Checking string `.length` before converting to `Buffer` is insufficient because multi-byte characters (like emojis) can result in different byte lengths for strings of the same character length.
**Prevention:** Always compare the lengths of the instantiated `Buffer` objects prior to calling `timingSafeEqual` instead of comparing the string lengths.
