## 2024-05-18 - Prevent SSRF in Node.js URL resolution

**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-10-17 - Fix timingSafeEqual Buffer length mismatch DoS

**Vulnerability:** Comparing multi-byte string lengths instead of Buffer byte lengths prior to calling `crypto.timingSafeEqual` throws a `RangeError` on byte length mismatch, leading to Unhandled Exceptions / Denial of Service.
**Learning:** JavaScript string `.length` counts UTF-16 code units while `Buffer.from()` measures UTF-8 byte length. Multi-byte characters (e.g. emojis or non-ASCII characters) produce Buffers with byte lengths that exceed string lengths.
**Prevention:** Always convert strings to `Buffer` instances first and compare `buffer1.length === buffer2.length` before passing them to `crypto.timingSafeEqual`.
