## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-10-17 - MS SQL Server Wildcard Injection
**Vulnerability:** MS SQL Server `LIKE` queries were vulnerable to wildcard injection because the `[` character was not escaped.
**Learning:** When sanitizing user input for parameterized MS SQL Server `LIKE` queries, `[` must be escaped in addition to `%` and `_`. The escaping order is critical: `[` must be escaped first to prevent double-escaping brackets.
**Prevention:** Always use `value.replaceAll("[", "[[]").replaceAll("%", "[%]").replaceAll("_", "[_]")` when constructing dynamic `LIKE` queries.
