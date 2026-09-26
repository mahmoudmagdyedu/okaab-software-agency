## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2025-05-18 - Prevent DoS from timingSafeEqual Buffer byte length mismatch
**Vulnerability:** Comparing JS string lengths (`expected.length === supplied.length`) before converting to Buffers for `crypto.timingSafeEqual` allows multi-byte UTF-8 strings with equal code unit lengths to produce Buffers of unequal byte lengths, throwing an unhandled TypeError/RangeError and causing DoS.
**Learning:** In Node.js, JS string `.length` measures UTF-16 code units, whereas `Buffer.from(str)` operates on UTF-8 bytes. `crypto.timingSafeEqual` requires Buffers of identical byte length.
**Prevention:** Always instantiate `Buffer` objects first and compare `bExpected.byteLength === bSupplied.byteLength` prior to calling `crypto.timingSafeEqual`.
