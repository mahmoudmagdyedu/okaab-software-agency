## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-10-13 - Prevent MS SQL LIKE wildcard injection
**Vulnerability:** User input used in parameterized MS SQL Server `LIKE` queries without escaping `[` can lead to wildcard injection or DoS attacks.
**Learning:** When sanitizing user input for MS SQL `LIKE` queries, `[`, `%`, and `_` characters must be escaped. The order of escaping is critical: `[` must be escaped first to avoid double-escaping brackets introduced by subsequent replacements.
**Prevention:** Always escape `[` first, i.e., `value.replaceAll("[", "[[]").replaceAll("%", "[%]").replaceAll("_", "[_]")`.
