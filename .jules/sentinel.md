## 2025-03-05 - SSRF via Node.js URL Construction
**Vulnerability:** Server-Side Request Forgery (SSRF) in proxy endpoints where `new URL(path, base)` is used with user-controlled paths.
**Learning:** Node.js evaluates paths starting with `//` or `/\` as protocol-relative URLs, overriding the base domain entirely. A single `replace(/^\/+/, "")` is insufficient if backslashes (`\`) are present or if `path` can be crafted to start with `//`.
**Prevention:** Prevent SSRF when using `new URL(path, base)` by aggressively stripping leading slashes and backslashes from user-provided paths (e.g., `path.replace(/^[/\\]+/, '')`) or by ensuring the path always safely starts with exactly one `/` before URL construction.
