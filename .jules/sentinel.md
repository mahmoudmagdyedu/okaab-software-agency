## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-10-12 - [Buffer length DoS in timingSafeEqual]
**Vulnerability:** Comparing string lengths before passing strings to `timingSafeEqual(Buffer.from(...))` in `src/routes/api/youtube/webhook.ts` causes unhandled exceptions if multi-byte characters are used, as string length does not equal byte length.
**Learning:** Node.js's `crypto.timingSafeEqual` strictly requires buffers of the exact same byte length. Multi-byte characters (e.g. utf-8 defaults) can bypass a string length check but fail the buffer length check, causing the application to crash (DoS risk).
**Prevention:** When using `crypto.timingSafeEqual` with strings, always instantiate the `Buffer` objects first and compare their lengths before calling `timingSafeEqual`.
