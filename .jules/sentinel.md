## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.
## 2023-10-24 - MS SQL LIKE Clause Wildcard Sanitization Order
**Vulnerability:** Wildcard injection / DoS via unsanitized `[` characters in user input passed to MS SQL Server `LIKE` clauses.
**Learning:** MS SQL Server treats `[` as a wildcard for ranges. When escaping, `[` must be escaped FIRST (`replaceAll("[", "[[]")`) before `%` and `_` (`[%]` and `[_]`). Otherwise, the brackets introduced to escape `%` and `_` would themselves get escaped, corrupting the query logic and leaving it vulnerable.
**Prevention:** Always escape `[` first, then `%`, then `_` when sanitizing user input for MS SQL `LIKE` statements: `value.replaceAll("[", "[[]").replaceAll("%", "[%]").replaceAll("_", "[_]")`.
