## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2024-10-07 - Fix DoS via timingSafeEqual exception on multi-byte payloads
**Vulnerability:** A DoS vulnerability existed in `src/routes/api/youtube/webhook.ts` where comparing string lengths before `timingSafeEqual(Buffer.from(a), Buffer.from(b))` could lead to an unhandled exception if `b` contains multi-byte characters (causing differing buffer byte lengths despite equal string lengths).
**Learning:** Always compare the byte length of instantiated Buffers, not the original string lengths, prior to calling `timingSafeEqual`.
**Prevention:** Convert strings to Buffer instances first, then compare `bufA.length === bufB.length` before passing them to `timingSafeEqual`.
