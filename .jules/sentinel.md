## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2024-05-18 - Prevent MS SQL LIKE Wildcard Injection
**Vulnerability:** MS SQL Server allows character range wildcards `[`, which were not being escaped when constructing `LIKE` query parameter values.
**Learning:** MS SQL Server uses `[`, `%`, and `_` as wildcard characters in `LIKE` queries. When only escaping `%` and `_`, attackers can inject `[` to perform wildcard injections (leading to DoS). Escaping order matters: `[` must be escaped first as `[[]` before escaping `%` and `_` to avoid double-escaping brackets.
**Prevention:** Always sanitize user input for MS SQL `LIKE` queries using `value.replaceAll("[", "[[]").replaceAll("%", "[%]").replaceAll("_", "[_]")`.
