## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-11-04 - Prevent DoS and timing leaks when using crypto.timingSafeEqual
**Vulnerability:** Comparing the string length of expected and supplied values before converting them to `Buffer` objects for `crypto.timingSafeEqual` can lead to unhandled runtime exceptions (`Input buffers must have the same byte length`) if they contain multi-byte characters. This can cause DoS or expose timing leaks.
**Learning:** String length (`.length`) is not always equal to byte length (e.g., when converting strings to UTF-8 buffers). `timingSafeEqual` strictly requires the `Buffer` objects to have the exact same byte length.
**Prevention:** Always convert the strings to `Buffer` objects first, store them in variables, and compare the `.length` properties of those `Buffer` objects before passing them to `timingSafeEqual`.
