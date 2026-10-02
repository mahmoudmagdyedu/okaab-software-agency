## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2024-05-18 - Prevent DoS from timingSafeEqual with multi-byte characters
**Vulnerability:** Comparing string lengths before passing strings to `Buffer.from()` for `crypto.timingSafeEqual()` can cause unhandled exceptions and DoS if multi-byte characters are used, because the resulting Buffers will have different byte lengths.
**Learning:** When using `crypto.timingSafeEqual` in Node.js, always compare the lengths of the instantiated `Buffer` objects, not the original strings.
**Prevention:** Ensure byte lengths are equal by comparing `expectedBuffer.length === suppliedBuffer.length` prior to calling `timingSafeEqual`.
