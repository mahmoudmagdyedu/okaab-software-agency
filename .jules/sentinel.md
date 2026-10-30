## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-10-30 - Buffer Length DoS in timingSafeEqual
**Vulnerability:** Node.js `crypto.timingSafeEqual` throws an unhandled exception if the provided buffers have different lengths. Comparing string lengths before converting to buffers allows an attacker to send multi-byte characters that pass the string length check but result in differing buffer lengths, leading to an unhandled exception and DoS.
**Learning:** String length (`.length`) counts characters, not bytes. When creating a Buffer from a string, the byte length may differ. Always compare `.length` on the instantiated `Buffer` objects before calling `timingSafeEqual`.
**Prevention:** Store the instantiated `Buffer` objects in variables, compare their `.length` properties, and then pass those exact variables to `timingSafeEqual`.
