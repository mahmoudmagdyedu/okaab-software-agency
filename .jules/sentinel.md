## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2025-05-20 - Prevent RangeError in timingSafeEqual Buffer comparison
**Vulnerability:** Calling `crypto.timingSafeEqual` on `Buffer` objects created from multi-byte strings can throw an unhandled `RangeError` if byte lengths differ despite string character lengths matching, leading to 500 responses / DoS.
**Learning:** String character length checks (`str1.length === str2.length`) do not guarantee equal `Buffer.byteLength` when strings contain multi-byte UTF-8 sequences.
**Prevention:** Instantiate `Buffer` objects first and compare `buf1.byteLength === buf2.byteLength` before invoking `crypto.timingSafeEqual`.
