## 2024-05-18 - Prevent SSRF in Node.js URL resolution

**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-11-08 - Prevent wildcard injection in MS SQL LIKE queries

**Vulnerability:** Unescaped brackets in MS SQL Server `LIKE` clauses allow attackers to use wildcard ranges (e.g., `[a-z]`), potentially leading to wildcard injection and Denial of Service (DoS) due to expensive pattern matching.
**Learning:** User input used in MS SQL `LIKE` queries must have `[`, `%`, and `_` characters escaped. The `[` must be escaped first to prevent double-escaping brackets introduced by subsequent replacements.
**Prevention:** Sanitize user input by aggressively replacing `[` with `[[]` before replacing `%` and `_` (e.g., `value.replaceAll("[", "[[]").replaceAll("%", "[%]").replaceAll("_", "[_]")`).
