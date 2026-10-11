## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2024-10-24 - DoS Vulnerability in timingSafeEqual
**Vulnerability:** Unhandled exception in `timingSafeEqual` caused by mismatched buffer byte lengths when comparing multi-byte string input.
**Learning:** `crypto.timingSafeEqual` throws an error if input buffers have different lengths. String length comparisons do not accurately reflect buffer byte lengths for multi-byte characters.
**Prevention:** Always convert strings to `Buffer` objects first and compare their `.length` properties (byte length) before using `timingSafeEqual`.
