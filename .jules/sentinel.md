## 2024-05-18 - Prevent SSRF in Node.js URL resolution

**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-10-18 - Compare instantiated Buffer lengths prior to crypto.timingSafeEqual

**Vulnerability:** Comparing string lengths before instantiating Buffers for `crypto.timingSafeEqual` allows multi-byte UTF-8 inputs to pass length checks while causing `crypto.timingSafeEqual` to throw `RangeError: The buffer lengths must be the same`, resulting in unhandled exceptions and DoS.
**Learning:** String `.length` measures character count, whereas `Buffer.from(str)` byte length depends on encoding.
**Prevention:** Always instantiate `Buffer` objects first and compare `buf1.length === buf2.length` directly before calling `timingSafeEqual`.
