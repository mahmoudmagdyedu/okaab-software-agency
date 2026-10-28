## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-10-28 - Prevent Wildcard Injection in MS SQL Server LIKE queries
**Vulnerability:** User input used in MS SQL Server `LIKE` queries wasn't fully escaped, missing the `[` character, which could lead to wildcard injection and DoS attacks.
**Learning:** When constructing parameterized MS SQL Server `LIKE` queries, user input must be sanitized by escaping `[`, `%`, and `_` characters. The order of escaping is critical: `[` must be escaped first.
**Prevention:** Always escape wildcards in the order: `value.replaceAll("[", "[[]").replaceAll("%", "[%]").replaceAll("_", "[_]")` to avoid double-escaping brackets introduced by subsequent replacements.
