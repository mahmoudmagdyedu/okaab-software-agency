## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2024-05-20 - Prevent SQL Server LIKE wildcard injection DoS
**Vulnerability:** MS SQL Server evaluates `[` as a pattern matching wildcard in `LIKE` clauses. Standard parameterization does not escape wildcards.
**Learning:** User input used in SQL Server `LIKE` queries must have `[`, `%`, and `_` explicitly escaped to prevent wildcard injection and expensive pattern-matching DoS.
**Prevention:** Always escape `[` first (e.g., `replaceAll("[", "[[]")`) before escaping `%` and `_`.
