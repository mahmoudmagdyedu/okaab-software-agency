## 2024-05-18 - Prevent SSRF in Node.js URL resolution

**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-11-04 - Safe Buffer comparison with crypto.timingSafeEqual

**Vulnerability:** Comparing string lengths instead of Buffer byte lengths before calling `crypto.timingSafeEqual` can throw an unhandled `ERR_CRYPTO_TIMING_SAFE_EQUAL_LENGTH` RangeError when inputs contain multi-byte characters, causing a Denial of Service (DoS) or leaking timing information.
**Learning:** `Buffer.from(string)` converts UTF-8 strings into varying byte lengths. String `.length` measures UTF-16 code units, not raw bytes.
**Prevention:** Always instantiate `Buffer` objects first and verify `expectedBuffer.length === suppliedBuffer.length` prior to calling `crypto.timingSafeEqual(expectedBuffer, suppliedBuffer)`.
