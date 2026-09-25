## 2024-05-18 - Prevent SSRF in Node.js URL resolution

**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-09-25 - Prevent unhandled TypeError in timingSafeEqual buffer comparison

**Vulnerability:** Comparing string lengths instead of Buffer byte lengths prior to crypto.timingSafeEqual allowed multi-byte character signatures to throw an unhandled TypeError.
**Learning:** String character length (string.length) and Buffer byte length (buffer.length) differ when multi-byte UTF-8 characters are present. Calling timingSafeEqual on unequal Buffer byte lengths throws an unhandled exception.
**Prevention:** Instantiate Buffers first and compare Buffer byte lengths (buf1.length !== buf2.length) prior to calling crypto.timingSafeEqual.
