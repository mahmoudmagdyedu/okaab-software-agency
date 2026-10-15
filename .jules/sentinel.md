## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-10-15 - Prevent Wildcard Injection in MS SQL Server LIKE queries
**Vulnerability:** When constructing MS SQL Server `LIKE` queries, failing to escape `[` before escaping `%` and `_` leaves the query vulnerable to wildcard injection or DoS attacks, or double-escapes brackets if `[` is escaped last.
**Learning:** User input used in MS SQL Server `LIKE` clauses must be sanitized by escaping `[` first (e.g., `value.replaceAll("[", "[[]").replaceAll("%", "[%]").replaceAll("_", "[_]")`) to avoid double-escaping brackets introduced by subsequent replacements.
**Prevention:** Always escape `[` first when sanitizing input for parameterized MS SQL Server `LIKE` queries.
