## 2024-05-18 - Prevent SSRF in Node.js URL resolution

**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2025-05-18 - Prioritize Cloudflare Header to Prevent IP Spoofing

**Vulnerability:** Checking `x-forwarded-for` before `cf-connecting-ip` allows clients to spoof `x-forwarded-for` headers, bypassing IP rate limits and logging.
**Learning:** In Cloudflare-backed applications, client-provided `x-forwarded-for` headers cannot be trusted over trusted proxy headers like `cf-connecting-ip`.
**Prevention:** Always prioritize `cf-connecting-ip` over `x-forwarded-for` when resolving client IP addresses behind Cloudflare.
