## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-10-18 - Prevent Unhandled Exceptions in timingSafeEqual
**Vulnerability:** Calling `crypto.timingSafeEqual` directly on buffers constructed from user input without checking their `.length` can lead to an unhandled exception (`Error: Input buffers must have the same byte length`), which can be exploited for DoS attacks.
**Learning:** Node's `timingSafeEqual` strictly expects buffers of identical lengths. The string length check prior to conversion isn't sufficient if strings contain multibyte characters, as their Buffer representations might differ in size.
**Prevention:** Always convert strings to Buffers first, cache them in variables, check if their `.length` properties are equal, and only then call `timingSafeEqual`.
