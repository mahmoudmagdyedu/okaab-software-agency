## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-10-24 - Prevent DoS from timingSafeEqual Buffer length mismatch
**Vulnerability:** Comparing original string lengths before calling `timingSafeEqual` with `Buffer.from` can lead to unhandled runtime exceptions (DoS) when multi-byte characters are present, as the byte length of the resulting buffers may differ despite equal string lengths.
**Learning:** When using `crypto.timingSafeEqual` in Node.js, the byte lengths of the instantiated `Buffer` objects must be compared prior to comparison, not the lengths of the original strings.
**Prevention:** Store the instantiated `Buffer` objects in variables and compare their `.length` properties before calling `timingSafeEqual`.
