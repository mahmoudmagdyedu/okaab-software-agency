## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-11-04 - SQL Wildcard Injection in MS SQL LIKE Clause
**Vulnerability:** Constructing parameterized MS SQL Server `LIKE` queries with user input fails to sanitize the `[` character first, allowing attackers to perform wildcard injection or DoS attacks.
**Learning:** The order of escaping characters in MS SQL `LIKE` queries is critical. If `[` is not escaped first, subsequent replacements (e.g., escaping `%` as `[%]`) could be double-escaped or manipulated.
**Prevention:** When constructing parameterized MS SQL Server `LIKE` queries, user input must be sanitized by escaping `[`, `%`, and `_` characters in this exact order: `value.replaceAll("[", "[[]").replaceAll("%", "[%]").replaceAll("_", "[_]")`.
