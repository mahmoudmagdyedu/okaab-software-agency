## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2024-05-18 - Prevent DoS with timingSafeEqual length validation
**Vulnerability:** Comparing string lengths before calling `timingSafeEqual` with Buffers created from those strings can lead to unhandled exceptions if the strings contain multi-byte characters (causing unequal buffer byte lengths despite equal string character lengths).
**Learning:** `timingSafeEqual` strictly requires Buffers to be of the exact same byte length and will throw an unhandled exception if they are not, opening an application to Denial of Service (DoS) attacks.
**Prevention:** Instantiate `Buffer` objects first, compare their byte lengths (`expectedBuffer.length === suppliedBuffer.length`), and only then pass them to `timingSafeEqual`.
