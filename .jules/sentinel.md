## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2025-02-23 - Fix crypto.timingSafeEqual Buffer length mismatch DoS
**Vulnerability:** Comparing original string lengths instead of instantiated Buffer byte lengths before calling `crypto.timingSafeEqual` caused unhandled RangeError exceptions when handling signatures with multi-byte characters.
**Learning:** `Buffer.from(string)` converts string characters into byte buffers where multi-byte UTF-8 characters produce a byte length greater than string length. `timingSafeEqual` throws an exception if the input Buffers have unequal byte lengths.
**Prevention:** Always compare `Buffer.byteLength` or `buffer1.length === buffer2.length` on the instantiated Buffer instances directly prior to invoking `timingSafeEqual`.
