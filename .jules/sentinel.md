## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2024-05-18 - Prevent DoS in timingSafeEqual with multi-byte characters
**Date:** 2024-05-18
**Title:** Prevent DoS in timingSafeEqual with multi-byte characters
**Vulnerability:** Comparing string lengths before passing `Buffer.from` to `timingSafeEqual` can cause unhandled exceptions (DoS) if an attacker provides a string with multi-byte characters that has the same string length but a different byte length.
**Learning:** Node.js `crypto.timingSafeEqual` strictly requires input buffers to have the exact same byte length, otherwise it throws an unhandled exception.
**Action:** Modified `validSignature` to compare lengths of the instantiated `Buffer` objects instead of strings.
**Prevention:** Always compare the byte length of the instantiated `Buffer` objects (e.g., `bufA.length === bufB.length`) rather than the length of the original strings before calling `timingSafeEqual`.
