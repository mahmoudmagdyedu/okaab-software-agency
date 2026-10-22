## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.
## 2026-10-22 - [Buffer length crash in timingSafeEqual]
**Vulnerability:** `timingSafeEqual` will throw an unhandled `RangeError` if the two `Buffer`s have different byte lengths. Comparing string lengths before calling `timingSafeEqual` does not prevent this if the strings contain multi-byte characters (e.g. UTF-8).
**Learning:** String length (`.length`) counts UTF-16 code units, while `Buffer.from(str).length` counts bytes. If an attacker provides a string with the same `.length` as the expected string but containing multi-byte characters, the resulting `Buffer` lengths will differ, causing `timingSafeEqual` to crash the server (DoS).
**Prevention:** Always compare the byte length of the instantiated `Buffer` objects, not the original string lengths.
