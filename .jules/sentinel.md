## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-10-16 - Prevent MS SQL Server wildcard injection in LIKE queries
**Vulnerability:** User input used in `LIKE` parameterized queries was missing escaping for the `[` character, allowing wildcard injection that could lead to unoptimized full-table scans and Denial of Service (DoS) attacks.
**Learning:** In MS SQL Server, `[` is a wildcard character used for character ranges (e.g., `[a-z]`). When escaping wildcards for `LIKE` clauses, `[` must be escaped first by wrapping it in brackets (`[[]`) before escaping `%` and `_`. If `[` is escaped after `%` or `_`, the brackets used to escape them (e.g. `[%]`) would themselves get incorrectly escaped, breaking the sanitization.
**Prevention:** Always escape `[`, `%`, and `_` in user input for MS SQL Server `LIKE` queries, strictly in the order: `value.replaceAll("[", "[[]").replaceAll("%", "[%]").replaceAll("_", "[_]")`.
