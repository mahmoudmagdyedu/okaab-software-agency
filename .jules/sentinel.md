## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.
## 2024-05-09 - [Buffer Length Mismatch in timingSafeEqual DoS]
**Vulnerability:** Comparing string lengths instead of Buffer lengths before calling `crypto.timingSafeEqual`. If the lengths of the buffers don't match (e.g., due to multi-byte characters), Node.js throws an unhandled exception, causing a DoS vulnerability.
**Learning:** Node.js `timingSafeEqual` strictly requires Buffers of the exact same byte length. Multi-byte string characters can have the same string length but different byte lengths, bypassing a simple string `.length` check.
**Prevention:** Always instantiate the Buffer objects first, and then compare `expectedBuffer.length === suppliedBuffer.length` before calling `timingSafeEqual`.
