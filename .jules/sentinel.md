## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-10-25 - Prevent timingSafeEqual RangeError on Buffer comparison
**Vulnerability:** Calling `timingSafeEqual` with Buffers created from string inputs without pre-comparing `Buffer.length` can cause `RangeError` exceptions if multi-byte characters or length mismatches occur during Buffer creation.
**Learning:** Comparing string lengths before Buffer conversion or comparing `.length` on created Buffers ensures `timingSafeEqual` safe invocation.
**Prevention:** Always instantiate `Buffer` objects in variables first, compare `expectedBuf.length === suppliedBuf.length`, and pass the Buffer variables to `timingSafeEqual`.
