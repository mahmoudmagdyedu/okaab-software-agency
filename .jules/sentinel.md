## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2024-09-30 - Prevent Wildcard Injection in MS SQL Server LIKE clauses
**Vulnerability:** MS SQL Server `LIKE` queries allow `[` as a wildcard. Unescaped `[` in user input can lead to wildcard injection and potential Denial of Service (DoS) attacks.
**Learning:** When constructing parameterized MS SQL Server `LIKE` queries, standard parameterization does not automatically escape `LIKE` wildcards.
**Prevention:** User input must be sanitized by escaping `[`, `%`, and `_` characters (e.g., replacing `[` with `[[]`).
