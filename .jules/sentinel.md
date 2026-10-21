## 2024-05-18 - Prevent SSRF in Node.js URL resolution

**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-10-21 - Buffer length check before crypto.timingSafeEqual

**Vulnerability:** Comparing string lengths before instantiating Buffer objects for `crypto.timingSafeEqual` can lead to unhandled runtime exceptions or timing leaks if string byte lengths differ from character lengths or when multi-byte characters are used.
**Learning:** `crypto.timingSafeEqual` throws a TypeError if the Buffer instances passed to it have different byte lengths. Buffer lengths must be compared directly after Buffer instantiation.
**Prevention:** Always instantiate Buffer objects first and compare `bufA.length === bufB.length` prior to invoking `crypto.timingSafeEqual(bufA, bufB)`.
