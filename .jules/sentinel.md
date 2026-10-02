## 2025-02-19 - [Node.js timingSafeEqual Buffer Length DoS]
**Vulnerability:** `timingSafeEqual` in Node.js can throw an error and cause a Denial of Service if the lengths of the Buffer objects are different. Checking the string lengths before buffer creation is insufficient because strings can have the same string length but different byte lengths (e.g., multi-byte characters like emojis).
**Learning:** String length checks do not guarantee matching byte lengths. `timingSafeEqual` strictly requires buffers of the exact same byte length.
**Prevention:** Always instantiate `Buffer.from(expected)` and `Buffer.from(supplied)`, and compare their byte lengths (`bufExpected.length === bufSupplied.length`) before calling `timingSafeEqual`.

## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.
