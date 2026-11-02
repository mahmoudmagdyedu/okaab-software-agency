## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.
## 2026-11-02 - [MS SQL LIKE Wildcard Escaping Order]
**Vulnerability:** Incomplete escaping of MS SQL Server `LIKE` wildcards. The `[` character was not escaped, allowing attackers to perform wildcard injection or DoS attacks.
**Learning:** In MS SQL Server, `[` is used for character ranges in `LIKE` patterns. When escaping user input for `LIKE` clauses, `[` must be escaped *before* `%` and `_` to prevent double-escaping the brackets used to escape them (`[%]` and `[_]`).
**Prevention:** Always escape `[` first when constructing parameterized MS SQL Server `LIKE` queries: `value.replaceAll("[", "[[]").replaceAll("%", "[%]").replaceAll("_", "[_]")`.
