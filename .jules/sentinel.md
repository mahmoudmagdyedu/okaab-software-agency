## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-11-06 - Safe Buffer comparison for crypto.timingSafeEqual
**Vulnerability:** Comparing string lengths before converting to Buffer in `validSignature` could allow length discrepancies between the resulting Buffers when handling multi-byte characters, throwing a runtime exception in `timingSafeEqual` and causing a Denial of Service.
**Learning:** `crypto.timingSafeEqual` strictly enforces that both Buffer arguments have identical byte lengths; comparing character lengths of strings does not guarantee identical byte lengths.
**Prevention:** Convert both strings to Buffer instances first, store them in variables, and compare their `.length` properties before invoking `crypto.timingSafeEqual`.
