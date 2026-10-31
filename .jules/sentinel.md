## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-10-31 - Prevent MS SQL Server Wildcard Injection
**Vulnerability:** User input used in MS SQL Server `LIKE` clauses was not properly escaping the `[` character, which could lead to wildcard injection and DoS.
**Learning:** MS SQL Server supports `[` as a wildcard character. If not escaped first (before `%` and `_`), it allows wildcard injection and possible DoS, and escaping order matters to avoid double-escaping brackets.
**Prevention:** Always escape `[` first (e.g., `.replaceAll("[", "[[]")`) before escaping `%` and `_` when parameterizing `LIKE` queries.
