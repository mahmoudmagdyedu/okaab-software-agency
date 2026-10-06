## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2024-05-18 - Prevent Wildcard Injection and DoS in MS SQL LIKE Queries
**Vulnerability:** User input used in MS SQL Server `LIKE` clauses without proper escaping of the `[` character allows wildcard injection, potentially leading to slow query execution (DoS) or unintended data disclosure.
**Learning:** In MS SQL Server, `[` is a wildcard character that denotes a set or range. If not escaped *before* escaping `%` and `_`, attackers can inject brackets to bypass other sanitization or cause performance issues.
**Prevention:** Sanitize user input by explicitly escaping `[` first (e.g., `value.replaceAll("[", "[[]").replaceAll("%", "[%]").replaceAll("_", "[_]")`) before using it in a parameterized `LIKE` query.
