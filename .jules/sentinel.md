## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-11-09 - Prevent DoS from timingSafeEqual with multi-byte characters
**Vulnerability:** Comparing string lengths before calling `timingSafeEqual` on `Buffer.from(string)` allows attackers to provide strings with the same character length but different byte lengths (e.g. multi-byte characters). This causes `timingSafeEqual` to throw an unhandled `RangeError`, leading to a Denial of Service (DoS).
**Learning:** `timingSafeEqual` strictly requires buffers of the exact same byte length.
**Prevention:** Always compare the `.length` of the instantiated `Buffer` objects, not the original strings.
