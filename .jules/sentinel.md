## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-11-07 - Prevent DoS from unhandled exceptions in crypto.timingSafeEqual
**Vulnerability:** Comparing string lengths before passing them to `Buffer.from()` and `crypto.timingSafeEqual()` can cause an unhandled `TypeError: Input buffers must have the same byte length` if a string contains multi-byte characters, leading to a Denial of Service.
**Learning:** String length does not always equal buffer byte length (e.g., UTF-8 strings with multi-byte characters).
**Prevention:** When using `crypto.timingSafeEqual`, always store the instantiated `Buffer` objects in variables and compare their `.length` properties before comparison to prevent unhandled exceptions.
