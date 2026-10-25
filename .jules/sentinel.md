## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-10-25 - Prevent unhandled exceptions with timingSafeEqual length checks
**Vulnerability:** Checking string lengths instead of Buffer byte lengths before calling `timingSafeEqual` can throw `ERR_CRYPTO_TIMING_SAFE_EQUAL_LENGTH` exceptions, potentially causing a Denial of Service (DoS) due to multi-byte UTF-8 character length mismatch.
**Learning:** When using `crypto.timingSafeEqual`, always compare the lengths of the instantiated `Buffer` objects (not the original string lengths) to prevent DoS attacks.
**Prevention:** Instantiate the buffers first, compare their byte lengths, and only then call `timingSafeEqual`.
