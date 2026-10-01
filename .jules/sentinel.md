## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2024-10-01 - Prevent DoS via timingSafeEqual Buffer Length Mismatch
**Vulnerability:** Comparing string lengths before passing strings with multi-byte characters to `Buffer.from()` and `timingSafeEqual` can result in buffers of different byte lengths, causing an unhandled exception and DoS.
**Learning:** `Buffer.from(string)` length depends on character encoding. Two strings of equal length may result in Buffers of unequal length if one contains multi-byte characters.
**Prevention:** Always convert strings to Buffers first and compare their `.length` properties before calling `crypto.timingSafeEqual`.
