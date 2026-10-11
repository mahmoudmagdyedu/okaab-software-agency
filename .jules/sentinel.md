## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2025-02-12 - Prevent Wildcard Injection in MS SQL Server LIKE queries
**Vulnerability:** MS SQL Server parameterized `LIKE` queries are vulnerable to wildcard injection if special characters (`[`, `%`, `_`) are not properly escaped in user input.
**Learning:** The order of escaping is critical. `[` must be escaped first as `[[]` before escaping `%` and `_`, to prevent wildcard character abuse and avoid double-escaping brackets introduced during subsequent replacements.
**Prevention:** Always sanitize user input for MS SQL Server `LIKE` queries by escaping `[` first, then `%` and `_`: `value.replaceAll("[", "[[]").replaceAll("%", "[%]").replaceAll("_", "[_]")`.
