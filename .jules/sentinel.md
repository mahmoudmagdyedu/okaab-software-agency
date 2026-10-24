## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-10-24 - Prevent DoS from timingSafeEqual with multi-byte characters
**Vulnerability:** Comparing string lengths before calling `timingSafeEqual` with `Buffer.from` can lead to an unhandled exception if the supplied string contains multi-byte characters, because the resulting byte lengths of the buffers will differ. This can cause a Denial of Service (DoS).
**Learning:** When using `crypto.timingSafeEqual` in Node.js, it strictly requires the `Buffer` objects to have the exact same byte length, not just the original strings having the same character length.
**Prevention:** Always convert the strings to `Buffer` objects first, store them in variables, and compare their `length` properties (byte length) before calling `timingSafeEqual`.
