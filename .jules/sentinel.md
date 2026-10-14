## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-10-14 - Fix MS SQL Server LIKE Wildcard Injection
**Vulnerability:** User input used in a parameterized MS SQL Server `LIKE` query was missing escaping for the `[` character, which could lead to wildcard injection and potential DoS attacks.
**Learning:** In MS SQL Server, `[` is a wildcard character used for range matching. When sanitizing user input for `LIKE` queries, `[` must be escaped first as `[[]` before escaping `%` and `_` to avoid double-escaping the brackets introduced by subsequent replacements.
**Prevention:** Always escape `[` first, then `%` and `_`, when constructing parameterized `LIKE` query inputs in MS SQL Server.
