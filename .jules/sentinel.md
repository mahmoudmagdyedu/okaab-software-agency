## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-10-29 - [DoS in timingSafeEqual via Multi-byte Characters]
**Vulnerability:** Comparing string lengths instead of Buffer lengths before calling `crypto.timingSafeEqual` allows unhandled exceptions (DoS) when an attacker supplies multi-byte characters (e.g., emojis) that match the expected string length but have a larger byte length.
**Learning:** Node.js's `timingSafeEqual` strictly expects buffers of identical byte lengths, and `Buffer.from(string)` expands multi-byte characters, mismatching original string lengths.
**Prevention:** Always instantiate Buffers first, then compare their `.length` properties before calling `timingSafeEqual`.
