## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-10-20 - MS SQL Server LIKE Query Escaping
**Vulnerability:** Wildcard injection (DoS) in MS SQL Server `LIKE` queries due to incorrect escaping order.
**Learning:** When sanitizing user input for MS SQL `LIKE` statements, it is necessary to escape `[`, `%`, and `_`. The `[` character must be escaped first as `[[]` to prevent double-escaping the brackets that are introduced when escaping `%` (as `[%]`) and `_` (as `[_]`). If `[` is escaped after, it will incorrectly escape the brackets meant to protect the wildcards.
**Prevention:** Always escape `[` first: `value.replaceAll("[", "[[]").replaceAll("%", "[%]").replaceAll("_", "[_]")`.
