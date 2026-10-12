## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-10-12 - Prevent wildcard injection in MS SQL Server LIKE queries
**Vulnerability:** When constructing parameterized MS SQL Server `LIKE` queries, failing to escape the `[` character before escaping `%` and `_` characters can lead to double-escaping if user input contains `%` or `_`, resulting in wildcard injection and potential Denial of Service (DoS) attacks.
**Learning:** The order of escaping is critical: `[` must be escaped first to avoid double-escaping brackets introduced by subsequent replacements.
**Prevention:** User input must be sanitized by escaping `[`, `%`, and `_` characters in the correct order: `value.replaceAll("[", "[[]").replaceAll("%", "[%]").replaceAll("_", "[_]")`.
