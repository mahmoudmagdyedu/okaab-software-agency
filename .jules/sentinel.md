## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2024-05-18 - Unescaped Bracket in SQL Server LIKE Clauses
**Vulnerability:** Unescaped `[` characters in parameterized `LIKE` queries allow users to inject character set wildcards (e.g., `[a-z]`) in SQL Server, potentially leading to unintended data exposure or performance issues (DoS).
**Learning:** SQL Server `LIKE` operator has additional wildcards `[` and `]` beyond the standard `%` and `_`. While parameterization prevents traditional SQL injection, it does not prevent wildcard injection if the parameter is used within a `LIKE` pattern.
**Prevention:** Always escape `[`, `%`, and `_` characters when taking user input for a SQL Server `LIKE` query. The standard way to escape `[` is by wrapping it in brackets: `[[]`.
