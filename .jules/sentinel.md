## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2024-05-19 - Fix MSSQL LIKE wildcard injection in learner search
**Vulnerability:** Unsanitized `[` characters in user input passed to MS SQL Server `LIKE` clauses allow wildcard injection and potential Denial of Service (DoS).
**Learning:** When sanitizing input for parameterized MS SQL `LIKE` queries, `[` must be escaped first (`[[]`) before `%` and `_`. If `[` is not escaped, attackers can inject set/range wildcards.
**Prevention:** Always escape `[` as `[[]`, `%` as `[%]`, and `_` as `[_]` in that exact order to avoid double-escaping brackets.
