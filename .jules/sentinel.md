## 2024-05-18 - Prevent SSRF in Node.js URL resolution

**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-10-23 - Buffer byte length comparison before timingSafeEqual

**Vulnerability:** Comparing string lengths (`expected.length === supplied.length`) before instantiating Buffer objects for `crypto.timingSafeEqual` allows multi-byte UTF-8 inputs to pass string length checks while having different Buffer byte lengths, triggering an uncaught `RangeError` exception in `timingSafeEqual`.
**Learning:** String length (`.length`) counts UTF-16 code units, whereas `Buffer.from(str)` measures byte length. `crypto.timingSafeEqual` strictly throws an exception if Buffer byte lengths differ.
**Prevention:** Always instantiate `Buffer` objects first and compare `buf1.length === buf2.length` using the Buffer byte lengths prior to calling `timingSafeEqual`.
