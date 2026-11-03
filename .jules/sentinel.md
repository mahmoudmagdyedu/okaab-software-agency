## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-11-03 - Prevent DoS from timingSafeEqual Buffer length mismatch
**Vulnerability:** Comparing string lengths instead of Buffer byte lengths before calling `crypto.timingSafeEqual` allows attackers to send multi-byte character strings that match the character length but not the byte length, causing Node.js to throw an unhandled `Error: Input buffers must have the same byte length`, leading to a Denial of Service (DoS) vulnerability.
**Learning:** Always instantiate `Buffer` objects first and compare their `.length` properties (byte lengths) before passing them to `timingSafeEqual`.
**Prevention:** Store Buffers in variables, verify `buffer1.length === buffer2.length`, and then call `timingSafeEqual(buffer1, buffer2)`.
