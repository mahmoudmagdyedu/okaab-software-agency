## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2023-10-25 - Prevent SQL Wildcard Injection in MS SQL Server
**Vulnerability:** MS SQL Server `LIKE` queries allow wildcard injection if `[` is not properly escaped alongside `%` and `_`.
**Learning:** When sanitizing user input for `LIKE` queries, `[` must be escaped first (e.g., `value.replaceAll("[", "[[]").replaceAll("%", "[%]").replaceAll("_", "[_]")`) to avoid double-escaping brackets introduced by subsequent replacements.
**Prevention:** Always escape `[` before other wildcards when sanitizing inputs for MS SQL Server parameterized `LIKE` queries.
