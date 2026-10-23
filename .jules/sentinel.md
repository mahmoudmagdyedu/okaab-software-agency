## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-10-23 - Buffer Length Comparison for timingSafeEqual
**Vulnerability:** DoS vulnerability in `validSignature` due to comparing string lengths before passing Buffers to `timingSafeEqual`. A multi-byte character in the supplied signature could bypass the string length check but cause `timingSafeEqual` to throw an error since the Buffer lengths differ.
**Learning:** `timingSafeEqual` strictly requires Buffers of the exact same byte length. String length does not equal byte length when multi-byte characters are involved.
**Prevention:** Always instantiate `Buffer` objects first and compare their `.length` properties before calling `timingSafeEqual`.
