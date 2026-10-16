## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.
## 2026-10-16 - MS SQL Server Wildcard Injection Mitigation
**Vulnerability:** MS SQL Server `LIKE` queries constructed with unsanitized or improperly sanitized user input allowed wildcard injection. The existing sanitization escaped `%` and `_` but missed the `[` character, which is also a wildcard in MS SQL used for character sets.
**Learning:** In MS SQL Server, when escaping input for `LIKE` clauses, the `[` character must be escaped as `[[]` *before* escaping `%` as `[%]` and `_` as `[_]`. If `[` is not escaped first, subsequent escapes for `%` and `_` will add brackets that would then be double-escaped if `[` was escaped last, or left unescaped if `[` was ignored entirely, leading to potential wildcard injection or DoS.
**Prevention:** Always escape `[` first, followed by `%` and `_` when constructing parameterized `LIKE` queries for MS SQL Server.
