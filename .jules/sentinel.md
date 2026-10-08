## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2024-10-24 - Prevent DoS in timingSafeEqual
**Vulnerability:** Comparing string lengths instead of Buffer lengths before calling `timingSafeEqual` can lead to unhandled exceptions when processing multi-byte strings, causing DoS vulnerabilities.
**Learning:** The byte length of a string can differ from its character length for multi-byte characters. `timingSafeEqual` strictly requires Buffers of the exact same byte length.
**Prevention:** Always compare the lengths of the instantiated Buffer objects (not the original string lengths before Buffer conversion) prior to calling `timingSafeEqual`.
