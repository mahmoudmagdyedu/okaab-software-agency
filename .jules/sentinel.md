## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-10-30 - Fix Unhandled Exception DoS in timingSafeEqual
**Vulnerability:** Node.js `crypto.timingSafeEqual` throws an unhandled exception when provided Buffers of different lengths. Comparing string lengths before Buffer conversion is insufficient because multi-byte characters result in different byte lengths, causing a DoS vulnerability.
**Learning:** Checking string `.length` before converting to a `Buffer` is insufficient because string length and byte length differ for multi-byte characters.
**Prevention:** Always convert strings to `Buffer` objects first, and then compare the `.length` of the instantiated `Buffer` objects prior to calling `timingSafeEqual`.
