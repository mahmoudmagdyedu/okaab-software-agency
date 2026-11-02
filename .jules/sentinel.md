## 2024-05-18 - Prevent SSRF in Node.js URL resolution

**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-11-02 - Safe buffer length comparison in crypto.timingSafeEqual

**Vulnerability:** Comparing string lengths before converting to Buffer instances in `crypto.timingSafeEqual` can cause unhandled exceptions or timing vulnerabilities when user input contains multi-byte UTF-8 characters.
**Learning:** `crypto.timingSafeEqual` throws a `RangeError` if the two Buffer arguments have different byte lengths. Comparing `.length` on strings measures UTF-16 code units, not Buffer byte length.
**Prevention:** Always instantiate Buffers first and compare `bufferA.length === bufferB.length` prior to invoking `timingSafeEqual`.
