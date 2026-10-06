## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2024-10-06 - Prevent MS SQL Server LIKE wildcard injection
**Vulnerability:** User input used in MS SQL Server `LIKE` queries without escaping `[` can lead to wildcard injection and DoS.
**Learning:** When sanitizing user input for `LIKE` queries in MS SQL Server, `[`, `%`, and `_` must be escaped. The order is critical.
**Prevention:** Always escape `[` first (e.g., `value.replaceAll("[", "[[]").replaceAll("%", "[%]").replaceAll("_", "[_]")`) to avoid double-escaping brackets introduced by subsequent replacements.
