## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-10-27 - Fix length check before timingSafeEqual
**Vulnerability:** Comparing string lengths before Buffer instantiation can cause DoS unhandled exceptions with multi-byte chars when passed to `crypto.timingSafeEqual` in Node.js.
**Learning:** When using `crypto.timingSafeEqual` in Node.js, always compare the lengths of the instantiated Buffer objects (not the original string lengths before Buffer conversion) prior to comparison. This avoids unhandled exceptions, timing attacks, or DoS vulnerabilities when handling multi-byte characters.
**Prevention:** Ensure Buffer byte lengths are verified to be equal before using `timingSafeEqual`.
