## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-11-01 - Prevent DoS from timingSafeEqual Buffer Length Mismatch
**Vulnerability:** In Node.js, `crypto.timingSafeEqual(bufA, bufB)` throws a `RangeError` if the two `Buffer` instances have different lengths. A DoS attack is possible if an attacker provides a multi-byte string that is identical in character length to the expected hash, but results in a different byte length when converted to a `Buffer`.
**Learning:** Checking string length with `expected.length === supplied.length` before calling `timingSafeEqual(Buffer.from(expected), Buffer.from(supplied))` is insufficient when handling potentially multi-byte input.
**Prevention:** Instantiate the buffers first and compare their byte lengths via `expectedBuffer.length === suppliedBuffer.length` before passing them to `timingSafeEqual`.
