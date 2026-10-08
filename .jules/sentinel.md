## 2024-05-18 - Prevent SSRF in Node.js URL resolution

**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2025-05-18 - Buffer length comparison before crypto.timingSafeEqual

**Vulnerability:** Comparing string lengths before Buffer conversion when using timingSafeEqual allows multi-byte UTF-8 inputs to pass string length check while failing Buffer byte length match, causing `timingSafeEqual` to throw an unhandled `RangeError` DoS.
**Learning:** String length in JavaScript counts UTF-16 code units whereas Buffer length counts bytes; non-ASCII input results in byte length mismatch.
**Prevention:** Always instantiate Buffer objects first and compare Buffer byte lengths before calling `crypto.timingSafeEqual`.
