## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-10-23 - Prevent DoS in timingSafeEqual with multi-byte characters
**Vulnerability:** Checking string length instead of Buffer length before calling `crypto.timingSafeEqual` can lead to unhandled exceptions (DoS) if strings contain multi-byte characters resulting in different buffer sizes but the same string length.
**Learning:** Node.js `timingSafeEqual` strictly requires buffers of the exact same byte length. Multi-byte characters can cause `Buffer.from(str).length !== str.length`.
**Prevention:** Always convert strings to Buffers first and compare the `.length` properties of the resulting Buffers before passing them to `timingSafeEqual`.
