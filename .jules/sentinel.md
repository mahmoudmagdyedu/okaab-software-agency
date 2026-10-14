## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-10-14 - Prevent unhandled exceptions in timingSafeEqual
**Vulnerability:** Comparing string lengths before converting to Buffers and calling `timingSafeEqual` can lead to unhandled exceptions and DoS if the strings contain multi-byte characters, resulting in buffers of different byte lengths.
**Learning:** When using `crypto.timingSafeEqual`, always compare the `byteLength` (or `length`) of the instantiated `Buffer` objects, not the original string lengths.
**Prevention:** Instantiate the `Buffer` objects first, then check `buf1.length === buf2.length` before calling `timingSafeEqual`.
