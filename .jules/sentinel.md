## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2024-05-18 - Prevent Wildcard Injection in MS SQL Server LIKE Queries
**Vulnerability:** MS SQL Server evaluates `[`, `%`, and `_` as wildcards in `LIKE` queries. Unsanitized user input can lead to Denial of Service (DoS) or unauthorized data exposure.
**Learning:** When using user input in parameterized MS SQL Server `LIKE` queries, it is crucial to explicitly escape `[`, `%`, and `_` characters.
**Prevention:** Always sanitize input by replacing wildcards with their escaped equivalents (e.g., replacing `[` with `[[]`) before injecting them into the parameterized query string.
