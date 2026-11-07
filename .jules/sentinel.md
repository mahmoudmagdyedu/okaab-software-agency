## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-11-07 - Prevent DoS in timingSafeEqual via Buffer length comparison
**Vulnerability:** Comparing string lengths instead of Buffer lengths before calling `timingSafeEqual` allows unhandled runtime exceptions when handling multi-byte characters, leading to DoS.
**Learning:** String length does not always equal Buffer length. `timingSafeEqual` strictly requires matching Buffer byte lengths.
**Prevention:** Always compare the `.length` of instantiated Buffer objects prior to `timingSafeEqual` comparison.
