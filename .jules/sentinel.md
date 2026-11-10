## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-11-10 - Secure Buffer Comparison for timingSafeEqual
**Vulnerability:** Comparing string lengths before calling `crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b))` can lead to unhandled exceptions and DoS vulnerabilities if the resulting Buffer lengths differ.
**Learning:** `timingSafeEqual` strictly requires Buffers of the exact same length. If lengths differ, it throws an error. Checking string lengths is insufficient because strings can have the same length but different byte lengths when converted to Buffers.
**Prevention:** Always instantiate Buffers first, store them in variables, and compare their `.length` properties before passing them to `timingSafeEqual`.
