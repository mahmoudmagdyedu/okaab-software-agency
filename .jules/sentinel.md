## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-10-26 - Prevent wildcard injection and DoS in MS SQL LIKE clauses
**Vulnerability:** Constructing MS SQL parameterized queries with `LIKE` clauses that use user input must correctly escape wildcards (`%`, `_`) and brackets (`[`). If `[` is not escaped first, subsequent replacements using brackets to escape wildcards will introduce new brackets that get double-escaped, causing malformed strings and potential DoS or unintended data exposure.
**Learning:** The order of character replacement matters when escaping input for `LIKE` clauses in MS SQL Server.
**Prevention:** When constructing parameterized MS SQL Server `LIKE` queries, user input must be sanitized by escaping `[`, `%`, and `_` characters. The order of escaping is critical: `[` must be escaped first (e.g., `value.replaceAll("[", "[[]").replaceAll("%", "[%]").replaceAll("_", "[_]")`).
