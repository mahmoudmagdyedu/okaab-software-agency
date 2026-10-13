## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-10-13 - SQL Server LIKE Clause Wildcard Injection (Missing bracket escaping)
**Vulnerability:** Unsanitized `[` character in user input allowed MS SQL Server wildcard injection, potentially leading to DoS or unintended data exposure via the `LIKE` operator.
**Learning:** When escaping wildcards (`%`, `_`) for MS SQL Server `LIKE` queries, the escape character itself (typically `[`) must be escaped *first* to avoid corrupting the subsequent escaping replacements.
**Prevention:** Always escape `[` as `[[]` before escaping `%` and `_`.
