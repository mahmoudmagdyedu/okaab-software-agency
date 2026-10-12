## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-10-12 - [Prevent DoS in timingSafeEqual]
**Vulnerability:** Comparing string lengths instead of Buffer lengths before calling `timingSafeEqual` can lead to `ERR_CRYPTO_TIMING_SAFE_EQUAL_LENGTH` exceptions and DoS if multibyte characters are supplied.
**Learning:** Always instantiate Buffer objects first and compare their `.length` properties to ensure identical byte lengths before passing to `timingSafeEqual`.
**Prevention:** Compare Buffer byte lengths instead of string character lengths prior to `timingSafeEqual`.
