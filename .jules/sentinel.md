## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-11-05 - Prevent MS SQL wildcard injection in LIKE queries
**Vulnerability:** User input in MS SQL Server `LIKE` queries can cause wildcard injection if `[`, `%`, and `_` are not properly escaped, potentially leading to DoS attacks.
**Learning:** When escaping user input for `LIKE` queries, the order of escaping is critical. The `[` character must be escaped first to avoid double-escaping brackets introduced by subsequent replacements for `%` and `_`.
**Prevention:** Always escape user input for `LIKE` queries in MS SQL Server by using `value.replaceAll("[", "[[]").replaceAll("%", "[%]").replaceAll("_", "[_]")`.
