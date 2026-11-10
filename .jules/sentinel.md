## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-11-10 - Fix DoS exception in timingSafeEqual with multi-byte chars
**Vulnerability:** Comparing string lengths instead of Buffer byte lengths before calling `crypto.timingSafeEqual` can throw an unhandled exception when processing multi-byte characters, leading to Denial of Service (DoS).
**Learning:** `Buffer.from()` converts strings to bytes. If a string contains multi-byte characters, its byte length will differ from its string length. `timingSafeEqual` strictly requires equal byte lengths and throws otherwise.
**Prevention:** When using `crypto.timingSafeEqual`, always compare the lengths of the instantiated `Buffer` objects (e.g., `expectedBuffer.length === suppliedBuffer.length`), not the original string lengths.
