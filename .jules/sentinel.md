## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-10-24 - DoS risk from timingSafeEqual string length comparison
**Vulnerability:** Comparing string lengths prior to checking `timingSafeEqual` with `Buffer.from(string)` can cause unhandled exceptions if the strings contain multi-byte characters, leading to Denial of Service (DoS).
**Learning:** In Node.js, `crypto.timingSafeEqual` requires the `Buffer` objects to have the exact same byte length. A string with the same character length as another may have a different byte length if it contains multi-byte characters.
**Prevention:** Always instantiate `Buffer` objects first, then compare their `.length` properties before calling `timingSafeEqual`.
