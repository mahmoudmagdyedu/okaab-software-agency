## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-10-16 - Prevent DoS in timingSafeEqual via Buffer length comparison
**Vulnerability:** Comparing string lengths before `timingSafeEqual` with `Buffer.from(string)` can lead to a runtime exception (DoS) if a string contains multi-byte characters, resulting in unequal byte lengths for the generated buffers.
**Learning:** When handling multi-byte characters (like utf-8 defaults) in user input, string length does not equal byte length. `timingSafeEqual` requires exactly matching buffer lengths or it will throw.
**Prevention:** Always compare the `.length` or `.byteLength` of the instantiated `Buffer` objects, not the original string lengths, before calling `crypto.timingSafeEqual`.
