## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2024-05-24 - Prevent DoS in timingSafeEqual with multi-byte characters
**Vulnerability:** Passing buffers of different byte lengths to `crypto.timingSafeEqual` throws an unhandled exception. Attackers can trigger a DoS by providing multi-byte characters in the signature.
**Learning:** Node's `timingSafeEqual` strictly requires matching byte lengths. Comparing `string.length` before converting to buffers is dangerous.
**Prevention:** Always compare the lengths of the instantiated `Buffer` objects prior to calling `timingSafeEqual`.
**Action:** Update signature verification logic to compare `Buffer` byte lengths before calling `timingSafeEqual`.
