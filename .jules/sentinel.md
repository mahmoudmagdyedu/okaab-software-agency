## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-11-05 - Prevent MS SQL Server wildcard injection and DoS in LIKE queries
**Vulnerability:** Constructing parameterized MS SQL Server `LIKE` queries without escaping `[` characters allows wildcard injection and DoS attacks.
**Learning:** User input must be sanitized by escaping `[`, `%`, and `_` characters, and `[` must be escaped first (e.g., `value.replaceAll("[", "[[]").replaceAll("%", "[%]").replaceAll("_", "[_]")`) to avoid double-escaping brackets.
**Prevention:** Always escape `[` first, then `%` and `_` when handling dynamic input for `LIKE` clauses in MS SQL Server.
