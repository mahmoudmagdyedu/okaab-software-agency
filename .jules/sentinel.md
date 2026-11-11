## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-11-11 - Prevent DoS when using crypto.timingSafeEqual
**Vulnerability:** Comparing string lengths before converting to Buffers for `timingSafeEqual` can lead to runtime exceptions if strings contain multi-byte characters, causing a Denial of Service (DoS) vulnerability.
**Learning:** When using `crypto.timingSafeEqual` in Node.js, always compare the lengths of the instantiated `Buffer` objects, not the original string lengths.
**Prevention:** Instantiate the `Buffer` objects first, store them in variables, compare their `.length` properties, and then use `timingSafeEqual`.
