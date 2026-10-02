## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2024-05-24 - Fix IP Spoofing Vulnerability
**Vulnerability:** Trusting `x-forwarded-for` over `cf-connecting-ip` allows IP spoofing when deployed behind Cloudflare.
**Learning:** Attackers can inject `x-forwarded-for` headers, which applications might blindly trust and use for rate limiting or restrictions, bypassing security measures.
**Prevention:** Always prioritize `cf-connecting-ip` when deployed behind Cloudflare, as Cloudflare strips and replaces it with the legitimate client IP.
