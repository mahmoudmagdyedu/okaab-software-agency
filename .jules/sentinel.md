## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2024-05-24 - Prevent DoS in timingSafeEqual
**Vulnerability:** Using string lengths instead of Buffer lengths before timingSafeEqual allows unhandled exceptions when multibyte characters are supplied.
**Learning:** Node.js timingSafeEqual requires buffers of identical length; string lengths don't account for multibyte characters.
**Action/Prevention:** Always instantiate Buffer objects first and compare their lengths prior to passing them to timingSafeEqual.
