## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-11-04 - Fix MS SQL Server wildcard injection via incorrect escaping order
**Vulnerability:** When escaping user input for MS SQL Server `LIKE` clauses, failing to escape `[` first causes brackets introduced by escaping `%` and `_` to either be double-escaped or leaves user-supplied brackets unescaped, allowing wildcard injection or DoS attacks.
**Learning:** The order of escaping characters matters in string replacement. `[` must be escaped as `[[]` before escaping `%` and `_` as `[%]` and `[_]`.
**Prevention:** Always escape `[` first when constructing parameterized MS SQL Server `LIKE` queries with `.replaceAll()`. (e.g., `value.replaceAll("[", "[[]").replaceAll("%", "[%]").replaceAll("_", "[_]")`).
