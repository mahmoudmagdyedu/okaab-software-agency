## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2025-02-28 - [MS SQL Wildcard Injection via LIKE Clause]
**Vulnerability:** MS SQL Server `LIKE` clauses support `[`, `%`, and `_` as wildcards. Code was escaping `%` and `_` but missed `[`, allowing attackers to perform wildcard injection or DoS by crafting expensive queries.
**Learning:** For parameterized MS SQL `LIKE` queries, all wildcards (`[`, `%`, `_`) must be escaped. The order matters: `[` must be escaped first to avoid escaping the brackets introduced by the other replacements.
**Prevention:** Always escape `[` first when sanitizing input for MS SQL `LIKE` clauses.
**Action:** Journal this and use proper order for replace functions.
