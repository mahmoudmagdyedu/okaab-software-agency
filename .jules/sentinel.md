## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-10-19 - timingSafeEqual Buffer Length DoS
**Vulnerability:** Unhandled exceptions in `crypto.timingSafeEqual` due to comparing lengths of strings before converting them to `Buffer` objects. Malicious users can send strings with the same character length but different byte lengths (using multi-byte characters), causing `timingSafeEqual` to throw an error and crash the request handling or application.
**Learning:** `timingSafeEqual` strictly requires input buffers of the exact same byte length. String length (character count) is not equivalent to byte length.
**Prevention:** Always convert strings to `Buffer` objects first, and then compare their `.length` properties (byte length) before passing them to `timingSafeEqual`.
