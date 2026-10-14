## 2024-05-18 - Prevent SSRF in Node.js URL resolution

**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-10-14 - Buffer byte length comparison before timingSafeEqual

**Vulnerability:** String length equality checks before `crypto.timingSafeEqual` fail when strings contain multi-byte UTF-8 characters, causing `crypto.timingSafeEqual` to throw an unhandled `RangeError` exception and crash request handling.
**Learning:** `string.length` returns character count while `Buffer.from(string)` length is byte count. If multi-byte characters are present, string lengths may match while byte lengths differ.
**Prevention:** Instantiate `Buffer` objects first and compare `bufA.length === bufB.length` before calling `crypto.timingSafeEqual(bufA, bufB)`.
