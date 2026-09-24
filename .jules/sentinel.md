## 2026-09-24 - Prevent SSRF via URL Path Sanitization in Reverse Proxies

**Vulnerability:** Reverse proxies constructed `new URL(path, base)` without stripping leading slashes/backslashes, enabling SSRF/open-redirect if `path` begins with `//` or `/\\`.
**Learning:** In Node.js / Web API `URL`, paths beginning with `//` or `/\\` override the base origin.
**Prevention:** Always sanitize upstream paths with `.replace(/^[/\\]+/, "/")` before passing them to `new URL(path, base)`.
