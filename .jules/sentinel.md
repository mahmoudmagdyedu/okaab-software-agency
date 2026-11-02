## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-11-02 - Prevent MS SQL Server LIKE wildcard injection
**Vulnerability:** User input used in MS SQL Server `LIKE` clauses without fully escaping `[` characters allows wildcard injection and DoS attacks.
**Learning:** When sanitizing user input for parameterized `LIKE` queries in MS SQL, the `[` character must be escaped first (`replaceAll("[", "[[]")`) before escaping `%` and `_`. If `[` is not escaped first, subsequent replacements can introduce unescaped brackets or double-escape existing ones.
**Prevention:** Always escape `[`, `%`, and `_` in that specific order when preparing user input for `LIKE` clauses.
