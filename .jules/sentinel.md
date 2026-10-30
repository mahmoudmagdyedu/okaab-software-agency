## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-10-30 - Prevent DoS with timingSafeEqual length comparisons
**Vulnerability:** Comparing string lengths before passing Buffers to `timingSafeEqual` causes unhandled exceptions if the strings contain multi-byte characters, leading to Denial of Service (DoS).
**Learning:** The byte lengths of the instantiated `Buffer` objects must be compared prior to calling `timingSafeEqual`, as utf-8 strings with multi-byte characters can have matching string lengths but differing byte lengths.
**Prevention:** Always compare `.length` properties of the `Buffer` objects, rather than the original string lengths, before passing them to `timingSafeEqual`.
