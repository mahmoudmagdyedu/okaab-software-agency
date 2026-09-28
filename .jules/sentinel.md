## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2025-03-09 - Node.js timingSafeEqual Buffer Length Mismatch DoS
**Vulnerability:** Unhandled exception in `timingSafeEqual` when comparing signatures due to multi-byte characters.
**Learning:** `timingSafeEqual` requires the two Buffer objects to have the exact same byte length. Checking string `.length` before instantiating buffers is insufficient and can lead to unhandled runtime errors if the input contains multi-byte characters.
**Prevention:** Always convert strings to Buffer objects first, then compare the `.length` or `.byteLength` of the Buffer objects themselves before calling `timingSafeEqual`.
