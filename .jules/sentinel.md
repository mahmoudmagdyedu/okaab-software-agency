## 2024-05-18 - Prevent SSRF in Node.js URL resolution

**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2025-05-18 - Sanitize MS SQL LIKE Wildcards in Correct Order

**Vulnerability:** Incorrect order of wildcard character escaping in MS SQL `LIKE` queries allowed `[` to remain unescaped, opening wildcard pattern injection or improper double-escaping if `[` was replaced after `%` or `_`.
**Learning:** In MS SQL Server `LIKE` queries, `[` must be escaped before `%` and `_` (`value.replaceAll("[", "[[]").replaceAll("%", "[%]").replaceAll("_", "[_]")`) so brackets introduced by `%` and `_` escaping are not re-escaped.
**Prevention:** Always escape `[` first when constructing parameterized MS SQL `LIKE` search clauses.
