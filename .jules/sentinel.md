## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-11-11 - Prevent DoS in timingSafeEqual
**Vulnerability:** Comparing string lengths instead of Buffer lengths before calling `crypto.timingSafeEqual` can lead to unhandled exceptions (DoS) when strings contain multi-byte characters.
**Learning:** `crypto.timingSafeEqual` strictly requires Buffers of the exact same byte length. Multi-byte strings converted to Buffers may have unexpected lengths, crashing the function if only their string lengths were validated.
**Prevention:** Always convert strings to Buffer objects first, and explicitly compare their `.length` properties before calling `timingSafeEqual`.
