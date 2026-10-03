## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2024-05-18 - Prevent MS SQL Server LIKE Wildcard Injection
**Vulnerability:** User input used in MS SQL Server `LIKE` clauses lacked escaping for the `[` character, which can lead to wildcard injection and Denial of Service (DoS) attacks.
**Learning:** Standard SQL parameterization does not automatically escape `LIKE` wildcards (`%`, `_`, `[`). Furthermore, `[` must be escaped first, before `%` and `_` are replaced with `[%]` and `[_]`.
**Prevention:** Always sanitize user input for MS SQL Server `LIKE` clauses using `.replaceAll("[", "[[]").replaceAll("%", "[%]").replaceAll("_", "[_]")`.
