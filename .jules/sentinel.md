## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-10-22 - [SQL Wildcard Injection]
**Vulnerability:** In MS SQL Server LIKE clauses, failing to escape `[` or escaping it after `%` and `_` allows wildcard injection and DoS attacks, while also potentially double-escaping.
**Learning:** When sanitizing user input for MS SQL Server parameterized `LIKE` queries, escape `[` first, then `%` and `_`.
**Prevention:** Use `value.replaceAll("[", "[[]").replaceAll("%", "[%]").replaceAll("_", "[_]")` to sanitize input safely.
