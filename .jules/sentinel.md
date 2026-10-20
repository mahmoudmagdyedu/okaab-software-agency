## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-10-20 - Mitigating timing attacks on secrets
**Vulnerability:** Simple string equality checks (`===` or `!==`) on API keys and secrets allow timing attacks.
**Learning:** Using simple string comparison for authentication tokens, API keys, and secrets exposes the application to timing attacks, where an attacker can determine the secret by observing the time taken to reject a request.
**Prevention:** Use `crypto.timingSafeEqual` with `Buffer.from` strings, ensuring the lengths of the Buffers are verified first, to safely compare secrets.
