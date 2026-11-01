## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-11-01 - [timingSafeEqual Denial of Service (DoS) Vulnerability]
**Vulnerability:** Node.js `crypto.timingSafeEqual` throws an unhandled `RangeError: Input buffers must have the same byte length` when the underlying Buffer byte lengths differ, which can happen if string lengths are compared prior to creating Buffers and the strings contain multi-byte characters. This causes the application to crash, leading to a Denial of Service (DoS).
**Learning:** String `.length` measures characters (or code units), not bytes. A string with multi-byte characters might have the same string `.length` as an ASCII string but a different Buffer byte length. Comparing string lengths before creating Buffers for `timingSafeEqual` is insufficient and vulnerable to DoS.
**Prevention:** Always instantiate `Buffer` objects first and store them in variables, then compare the `.length` property of the `Buffer` objects themselves before passing them to `timingSafeEqual`.
