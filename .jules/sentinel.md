## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.
## 2026-10-22 - Prevent Denial of Service in timingSafeEqual
**Vulnerability:** Comparing string lengths before passing them as Buffers to `timingSafeEqual` can lead to an unhandled exception if a malicious string contains multi-byte characters, crashing the server.
**Learning:** When using `crypto.timingSafeEqual` in Node.js, always instantiate the `Buffer` objects first and compare their `.length` properties. String lengths (character count) can differ from Buffer byte lengths, triggering a runtime error in `timingSafeEqual`.
**Prevention:** Store the `Buffer.from()` results in variables and strictly compare their lengths prior to calling `timingSafeEqual`.
