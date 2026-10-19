## 2024-05-18 - Prevent SSRF in Node.js URL resolution

**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-10-19 - Compare Buffer lengths for timingSafeEqual

**Vulnerability:** Comparing original string lengths instead of Buffer byte lengths before calling `crypto.timingSafeEqual` can cause unexpected behavior or exceptions when multi-byte character strings are passed.
**Learning:** `Buffer.from(string)` converts strings into byte buffers, whose byte lengths may differ from `.length` of utf-8 strings.
**Prevention:** Always instantiate `Buffer` objects first, store them in variables, and compare their `.length` properties prior to calling `timingSafeEqual`.
