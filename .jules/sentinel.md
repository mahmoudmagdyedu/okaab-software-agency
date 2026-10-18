## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-10-18 - Prevent MS SQL Server wildcard injection
**Vulnerability:** User inputs passed directly into MS SQL Server `LIKE` queries without escaping `[` can lead to wildcard injection and potential Denial of Service (DoS).
**Learning:** When sanitizing inputs for MS SQL Server `LIKE` queries, `[` must be escaped first as `[[]` to prevent double-escaping when later escaping `%` and `_`.
**Prevention:** Ensure the proper sequence of replacements is used: `value.replaceAll("[", "[[]").replaceAll("%", "[%]").replaceAll("_", "[_]")`.
