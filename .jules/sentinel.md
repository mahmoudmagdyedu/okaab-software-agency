## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-11-07 - Prevent DoS from timingSafeEqual Buffer mismatch
**Vulnerability:** Comparing string lengths prior to instantiating Buffers for `crypto.timingSafeEqual` allows a Denial of Service. If a multi-byte character is provided, the resulting Buffer will have a different byte length than the string length, causing `timingSafeEqual` to throw an unhandled `RangeError`, crashing the application.
**Learning:** `timingSafeEqual` strictly operates on byte lengths. String length comparisons do not guarantee equal Buffer byte lengths.
**Prevention:** Store the instantiated Buffers in variables and compare their `.length` properties (byte length) before calling `timingSafeEqual`.
