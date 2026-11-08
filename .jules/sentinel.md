## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-11-08 - Prevent MS SQL Server Wildcard Injection
**Vulnerability:** Unescaped bracket characters (`[`) in MS SQL Server parameterized `LIKE` queries allow wildcard injection attacks.
**Learning:** When sanitizing user input for MS SQL Server `LIKE` clauses, the order of escaping is critical: `[` must be escaped first, followed by `%` and `_`.
**Prevention:** User input must be sanitized by escaping `[`, `%`, and `_` characters. The order of escaping is critical: `[` must be escaped first (e.g., `value.replaceAll("[", "[[]").replaceAll("%", "[%]").replaceAll("_", "[_]")`) to avoid double-escaping brackets introduced by subsequent replacements. This prevents wildcard injection and DoS attacks.
