## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2024-09-26 - Prevent DoS in Node.js timingSafeEqual
**Vulnerability:** Comparing string lengths before calling `timingSafeEqual` on `Buffer.from(string)` can cause an unhandled exception if strings contain multi-byte characters, leading to Denial of Service (DoS).
**Learning:** `timingSafeEqual` requires buffers to be the exact same length. String length (character count) does not always equal Buffer length (byte count).
**Prevention:** Always convert strings to Buffers first, then compare the lengths of the instantiated Buffer objects before calling `timingSafeEqual`.
