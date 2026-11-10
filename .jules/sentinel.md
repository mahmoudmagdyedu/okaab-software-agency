## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-11-10 - Prevent timingSafeEqual DoS from Multi-Byte String Length Mismatch
**Vulnerability:** Comparing string lengths before calling crypto.timingSafeEqual with Buffer.from causes RangeError runtime exceptions when processing multi-byte characters, leading to denial of service.
**Learning:** In Node.js, string.length measures UTF-16 code units while Buffer.from byte length measures UTF-8 bytes. Strings with matching character lengths can have differing byte lengths, triggering unhandled RangeError exceptions in crypto.timingSafeEqual.
**Prevention:** Instantiate Buffer objects first, store Buffers in variables, and compare their .length byte properties prior to invoking crypto.timingSafeEqual.
