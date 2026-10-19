## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-10-19 - Prevent timingSafeEqual exceptions and DoS
**Vulnerability:** Comparing string lengths before converting to Buffers when using `crypto.timingSafeEqual` can lead to unhandled exceptions if the resulting buffers have different lengths (e.g. due to encoding differences).
**Learning:** Always instantiate Buffer objects first and compare their lengths before passing them to `timingSafeEqual` to avoid crashing the server on invalid input length.
**Prevention:** When using `timingSafeEqual`, create the Buffer instances, store them in variables, compare their `.length` properties, and then use `timingSafeEqual` on the buffers.
