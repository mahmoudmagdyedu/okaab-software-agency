## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2024-05-27 - Unhandled Exception (DoS) with Node.js crypto.timingSafeEqual
**Vulnerability:** Comparing multi-byte strings with `crypto.timingSafeEqual` by checking string length first, but passing raw converted Buffers to the function.
**Learning:** String length does not equal byte length. `timingSafeEqual` strictly requires Buffers of the exact same byte length. If an attacker submits a string with identical length but containing multi-byte characters, the resulting `Buffer` will have a different byte length, causing Node.js to throw a fatal unhandled exception (`Input buffers must have the same byte length`).
**Prevention:** Always instantiate `Buffer` objects explicitly and check `bufferA.byteLength === bufferB.byteLength` or `bufferA.length === bufferB.length` immediately prior to invoking `timingSafeEqual`.
