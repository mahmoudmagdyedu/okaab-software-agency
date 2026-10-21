## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-10-21 - Prevent DoS and unhandled exceptions in timingSafeEqual
**Vulnerability:** Comparing string lengths instead of Buffer lengths before calling `crypto.timingSafeEqual` allows multi-byte characters to bypass length checks, throwing unhandled exceptions when Buffer lengths differ.
**Learning:** `crypto.timingSafeEqual` strictly requires Buffers of equal length. Checking `.length` on strings before conversion does not account for multi-byte character encoding sizes, leading to application crashes or timing vulnerabilities.
**Prevention:** Always convert strings to Buffers first, store them in variables, and compare the `.length` properties of the instantiated Buffers prior to calling `timingSafeEqual`.
