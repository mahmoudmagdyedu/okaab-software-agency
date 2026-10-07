## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2024-10-07 - Prevent DoS in timingSafeEqual by comparing Buffer lengths
**Vulnerability:** Comparing string lengths before calling `timingSafeEqual` with `Buffer.from()` can lead to unhandled exceptions (DoS) if the strings contain multi-byte characters, as the resulting Buffers will have different byte lengths.
**Learning:** When using `crypto.timingSafeEqual` in Node.js, always compare the byte lengths of the instantiated `Buffer` objects, not the lengths of the original strings, to avoid `RangeError`.
**Prevention:** Convert strings to Buffers first, and compare the `length` property of the Buffer objects before calling `timingSafeEqual`.
