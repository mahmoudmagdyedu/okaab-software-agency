## 2024-05-18 - Prevent SSRF in Node.js URL resolution

**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-11-05 - Safe Buffer Length Check Before timingSafeEqual

**Vulnerability:** Comparing string lengths before calling `crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b))` causes unhandled runtime exceptions (`Input buffers must have the same byte length`) and potential DoS when user-supplied input contains multi-byte characters.
**Learning:** `string.length` measures UTF-16 code units while `Buffer.from(string)` calculates byte length. Attackers can provide crafted multi-byte strings that match the expected string length but differ in byte length, triggering runtime crashes.
**Prevention:** Always convert strings to Buffers first and compare `bufferA.length === bufferB.length` before invoking `crypto.timingSafeEqual(bufferA, bufferB)`.
