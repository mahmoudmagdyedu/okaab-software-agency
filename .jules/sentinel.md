## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.
## 2026-11-02 - [CRITICAL] MS SQL Server Wildcard Injection
**Vulnerability:** Unescaped `[` characters in user input passed to MS SQL Server `LIKE` clauses allowed attackers to inject wildcards, leading to a potential DoS attack (e.g., `[a-z]%`).
**Learning:** In MS SQL Server, `[` is a wildcard character used in `LIKE` queries. When sanitizing user input for parameterization with wildcards, `[` must be escaped first, before escaping `%` and `_`, to avoid double-escaping the brackets introduced by the other replacements.
**Prevention:** Always sanitize user input intended for `LIKE` clauses using a robust escaping sequence: `.replaceAll("[", "[[]").replaceAll("%", "[%]").replaceAll("_", "[_]")`.
