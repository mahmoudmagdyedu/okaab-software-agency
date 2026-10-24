## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-10-24 - MS SQL Server LIKE wildcard escaping order
**Vulnerability:** Unescaped `[` characters in user input passed to MS SQL Server `LIKE` queries allow wildcard pattern injection.
**Learning:** In MS SQL Server `LIKE` queries, `[` acts as a character set wildcard. Escaping `[` after `%` or `_` double-escapes brackets introduced by previous replacements.
**Prevention:** Always escape `[` first using `.replaceAll("[", "[[]")` before replacing `%` and `_` in user-supplied `LIKE` search strings.
