## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2024-05-19 - Prevent DoS in timingSafeEqual comparisons
**Vulnerability:** Node.js `crypto.timingSafeEqual` throws an unhandled exception if the provided Buffer objects have different byte lengths. Comparing string lengths is insufficient because multi-byte characters can cause matching string lengths but different Buffer byte lengths, leading to a Denial of Service (DoS) vulnerability.
**Learning:** String length checks do not guarantee equal byte lengths when converted to Buffers, especially with utf-8 encoding.
**Prevention:** Always compare the `length` property of the instantiated `Buffer` objects, not the original string lengths, before calling `timingSafeEqual`.
