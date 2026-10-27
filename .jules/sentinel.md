## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.
## 2026-10-27 - [MEDIUM] Fix SQL Server wildcard injection vulnerability
**Vulnerability:** The admin learners search API failed to escape `[` characters when constructing a MS SQL Server `LIKE` query.
**Learning:** When sanitizing user input for MS SQL Server `LIKE` queries, `[` characters must be escaped as `[[]` *before* escaping `%` or `_`. If `[` is not escaped, it can be used for wildcard injection. If it's escaped after `%` and `_` which are escaped as `[%]` and `[_]`, the escaping of `[` will erroneously double-escape those brackets (e.g. `[%]` becomes `[[]%[]]`), breaking the query or opening a path for DoS.
**Prevention:** Always escape `[` first using `.replaceAll("[", "[[]")` before escaping `%` and `_` when constructing parameterized `LIKE` queries in MS SQL Server.
