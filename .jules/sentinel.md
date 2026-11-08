## 2024-05-18 - Prevent SSRF in Node.js URL resolution

**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-11-08 - Prevent DoS and Timing Leaks in Buffer timingSafeEqual Comparisons

**Vulnerability:** Comparing string lengths before instantiating Buffer objects for `crypto.timingSafeEqual` risks unhandled `RangeError` exceptions and denial of service if multi-byte characters or encoding differences cause buffer lengths to mismatch.
**Learning:** In Node.js, `crypto.timingSafeEqual` strictly enforces that both `Buffer` arguments must have identical byte lengths (`bufA.length === bufB.length`), throwing an exception otherwise. Comparing `.length` on strings before Buffer instantiation does not reflect actual byte lengths in utf-8.
**Prevention:** Instantiate both `Buffer` objects first and explicitly check `expectedBuf.length === suppliedBuf.length && crypto.timingSafeEqual(expectedBuf, suppliedBuf)`.
