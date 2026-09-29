## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2024-05-24 - Prevent RangeError DoS in crypto.timingSafeEqual
**Vulnerability:** Unauthenticated DoS vulnerability caused by checking string lengths instead of Buffer byte lengths before calling timingSafeEqual.
**Learning:** When comparing string signatures using timingSafeEqual, multi-byte characters can cause matching string lengths but different Buffer byte lengths, crashing the server with a RangeError.
**Prevention:** Always convert strings to Buffer objects first, then compare their byte lengths before executing timingSafeEqual.
