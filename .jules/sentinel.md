## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-10-22 - Escape Brackets First in MS SQL LIKE Wildcard Queries
**Vulnerability:** User-controlled search inputs in MS SQL LIKE queries were escaping `%` and `_` without escaping `[` first, allowing wildcard character range injection and potential performance degradation.
**Learning:** MS SQL Server evaluates `[` as wildcard range pattern matching in LIKE queries. Escaping `[` must occur prior to `%` and `_` to avoid double-escaping brackets introduced by subsequent replacements.
**Prevention:** Sanitize MS SQL LIKE inputs by escaping `[` first via `.replaceAll("[", "[[]").replaceAll("%", "[%]").replaceAll("_", "[_]")`.
