## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2024-10-25 - Unhandled Exception DoS in timingSafeEqual
**Vulnerability:** Comparing string lengths before passing strings converted to Buffers to `crypto.timingSafeEqual` allows an attacker to cause an unhandled exception by sending multi-byte characters that match the string length but not the byte length.
**Learning:** Node.js `Buffer.from(string)` with default UTF-8 encoding changes the length of strings containing multi-byte characters. `crypto.timingSafeEqual` throws if the input buffers have different byte lengths.
**Prevention:** Always convert strings to `Buffer` objects first and compare their `length` properties before calling `timingSafeEqual`.
**Action:** Added explicit buffer conversion and length comparison to webhook signature validation.
