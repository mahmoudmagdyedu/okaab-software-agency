## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-10-23 - Prevent MS SQL LIKE wildcard injection
**Vulnerability:** User input used in MS SQL Server `LIKE` queries wasn't fully sanitized. The `[` character was not escaped, leading to potential wildcard injection and DoS attacks.
**Learning:** In MS SQL Server, `[`, `%`, and `_` are wildcards in `LIKE` clauses. Escaping `[` must happen first to avoid double-escaping brackets introduced by subsequent replacements.
**Prevention:** Sanitize user input for `LIKE` clauses by escaping in the correct order: `value.replaceAll("[", "[[]").replaceAll("%", "[%]").replaceAll("_", "[_]")`.
