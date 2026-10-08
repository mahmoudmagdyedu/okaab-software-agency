## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2024-05-18 - Unhandled Exception DoS in timingSafeEqual
**Vulnerability:** Comparing string lengths instead of Buffer byte lengths before calling `crypto.timingSafeEqual` can lead to an unhandled exception and potential DoS if multi-byte characters are supplied.
**Learning:** Node.js `timingSafeEqual` throws if the Buffer lengths do not match exactly. Multi-byte characters in a string can result in a Buffer with a larger byte length than its string length.
**Prevention:** Always convert strings to Buffers first, and then compare the byte lengths of the resulting Buffers before invoking `timingSafeEqual`.
**Action:** Converted strings to buffers and compared buffer lengths prior to invoking `timingSafeEqual`.
