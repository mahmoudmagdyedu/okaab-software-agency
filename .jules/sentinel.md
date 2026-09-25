## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2024-05-18 - Prevent DoS in timingSafeEqual
**Vulnerability:** Comparing string lengths before passing them to Buffer.from() and crypto.timingSafeEqual() can cause unhandled exceptions and DoS if the strings contain multi-byte characters, since their byte lengths will differ.
**Learning:** crypto.timingSafeEqual throws when the instantiated Buffer objects have different byte lengths. Validating the lengths of strings before buffer instantiation is unsafe because string length does not equal byte length for multi-byte characters.
**Prevention:** Always instantiate the Buffer objects first, and then compare their lengths (.length or .byteLength) prior to calling crypto.timingSafeEqual.
