## 2024-05-18 - Prevent SSRF in Node.js URL resolution

**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2025-05-18 - Prevent DoS in Node.js crypto.timingSafeEqual with Buffer Byte Length Comparison

**Vulnerability:** Comparing JavaScript string lengths prior to passing Buffers to `crypto.timingSafeEqual` causes unhandled `TypeError` exceptions when multi-byte UTF-8 characters are present in the input, leading to Denial of Service (DoS).
**Learning:** JavaScript string length counts UTF-16 code units, whereas `Buffer.from(str)` computes UTF-8 byte length. Buffers with differing byte lengths cause `crypto.timingSafeEqual` to throw an unhandled exception.
**Prevention:** Always instantiate `Buffer` objects first and compare `buf1.length === buf2.length` (byte lengths) before invoking `crypto.timingSafeEqual(buf1, buf2)`.
