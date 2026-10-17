## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-10-17 - Prevent DoS in timingSafeEqual
**Vulnerability:** `timingSafeEqual` throws an unhandled error if the given Buffers do not have the same byte lengths. Comparing the string `.length` property before converting them to `Buffer` objects is insufficient because UTF-8 characters can occupy multiple bytes while taking up a single string character, enabling a Denial of Service attack if a malicious input is provided.
**Learning:** Always compare the byte lengths of the created Buffer objects rather than the original string lengths.
**Prevention:** Compare `expectedBuf.length === suppliedBuf.length` where `expectedBuf` and `suppliedBuf` are the instantiated `Buffer` variables.
