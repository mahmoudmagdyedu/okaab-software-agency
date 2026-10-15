## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-10-15 - Unhandled Exception DoS in timingSafeEqual
**Vulnerability:** Node's `crypto.timingSafeEqual` throws an unhandled exception if the two `Buffer` objects have different byte lengths. Comparing string lengths before converting to buffers allows an attacker to send multi-byte characters, creating buffers of mismatched lengths while passing the string length check, crashing the application (DoS).
**Learning:** String length does not equal byte length when multi-byte characters are involved. `Buffer.from(string)` converts string characters to bytes, changing the length.
**Prevention:** Always compare the byte length of the instantiated `Buffer` objects (e.g., `bufA.length === bufB.length`) immediately before calling `timingSafeEqual`.
