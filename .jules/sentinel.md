## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2024-05-24 - DoS via timingSafeEqual String Length Check
**Vulnerability:** Using string length checks instead of buffer byte length checks before `timingSafeEqual` leads to unhandled exceptions when processing multi-byte characters.
**Learning:** `timingSafeEqual` crashes if the provided Buffers have different byte lengths. String length comparisons do not accurately reflect byte lengths for multi-byte payloads.
**Prevention:** Always compare the `.length` of the instantiated Buffer objects before calling `timingSafeEqual`.
**Action:** Ensure all `timingSafeEqual` usages check buffer lengths first.
