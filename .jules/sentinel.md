## 2024-05-18 - Prevent SSRF in Node.js URL resolution

**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-10-20 - Compare Buffer byte lengths before calling timingSafeEqual

**Vulnerability:** Comparing original string lengths before Buffer conversion or passing Buffers of unequal lengths to `crypto.timingSafeEqual` causes runtime exceptions or timing leaks when handling multi-byte UTF-8 characters.
**Learning:** `crypto.timingSafeEqual` strictly requires Buffer inputs of identical byte lengths.
**Prevention:** Instantiate `Buffer` objects first and compare `expectedBuf.length === suppliedBuf.length` before calling `timingSafeEqual(expectedBuf, suppliedBuf)`.
