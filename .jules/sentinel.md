## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-10-26 - MS SQL Server LIKE Wildcard Injection (Bracket Escaping)
**Vulnerability:** User input for an MS SQL Server `LIKE` search was escaped for `%` and `_`, but not `[`.
**Learning:** In MS SQL Server, `[` is a wildcard character that initiates a bracket expression. It must be escaped as `[[]` to prevent wildcard injection (which can lead to slow queries or unexpected results). Furthermore, the order of replacement is critical: `[` *must* be replaced before `%` and `_` to avoid double-escaping the brackets added by those subsequent replacements.
**Prevention:** Always escape `[`, `%`, and `_` in that exact order when constructing sanitized inputs for MS SQL Server `LIKE` clauses.
