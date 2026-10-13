## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-10-13 - Prevent timing side-channel attacks during secret comparison
**Vulnerability:** Direct string equality comparison (`===`) in internal secret authentication handlers allowed potential timing side-channel attacks to deduce valid secret keys.
**Learning:** In Node.js, secret header or token comparisons must use `crypto.timingSafeEqual` after verifying matching lengths on converted Buffers.
**Prevention:** Always compare lengths of instantiated Buffer objects prior to running `timingSafeEqual(bufA, bufB)` to prevent timing side-channels without throwing length mismatch errors.
