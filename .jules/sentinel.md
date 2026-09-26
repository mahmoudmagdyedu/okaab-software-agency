## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2024-05-19 - Prevent DoS in timingSafeEqual with multi-byte characters
**Vulnerability:** Unhandled exceptions causing DoS when comparing strings of the same length but different byte lengths using `timingSafeEqual(Buffer.from(a), Buffer.from(b))`.
**Learning:** Multi-byte characters can cause `Buffer.from(string)` to have a different byte length than the original string's character length. `timingSafeEqual` throws an exception if the input buffers have different byte lengths.
**Prevention:** Always instantiate the Buffer objects first and compare their byte lengths (`bufferA.length === bufferB.length`) prior to calling `timingSafeEqual`.
**Action:** Implemented buffer byte length comparison before calling `timingSafeEqual` in `src/routes/api/youtube/webhook.ts`.
