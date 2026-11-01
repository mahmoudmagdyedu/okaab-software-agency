## 2024-05-18 - Prevent SSRF in Node.js URL resolution

**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-11-01 - Buffer length check in timingSafeEqual

**Vulnerability:** Comparing string lengths (`expected.length === supplied.length`) before converting to Buffer in `crypto.timingSafeEqual` can throw an unhandled `RangeError` if characters have differing byte lengths in UTF-8, potentially causing DoS or revealing timing differences.
**Learning:** `crypto.timingSafeEqual` strictly checks that both `Buffer` instances have identical byte lengths (`buffer.length`), not string code-unit length.
**Prevention:** Always instantiate `Buffer` objects first and verify `expectedBuf.length === suppliedBuf.length` before invoking `timingSafeEqual(expectedBuf, suppliedBuf)`.
