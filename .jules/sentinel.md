## 2024-05-18 - Prevent SSRF in Node.js URL resolution

**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-10-28 - Escape MS SQL Server LIKE wildcard brackets

**Vulnerability:** Parameterized MS SQL Server `LIKE` queries replacing `%` and `_` without escaping `[` allow character set wildcard injection (e.g. `[a-z]`), leading to pattern injection and unexpected search matching.
**Learning:** In MS SQL Server `LIKE` expressions, `[` is a wildcard character used for character set brackets and must be expanded/escaped as `[[]`. Escaping `[` must happen before `%` and `_` to avoid double-escaping brackets introduced by subsequent replacements.
**Prevention:** Always escape `[` first with `.replaceAll("[", "[[]")` before replacing `%` and `_` in user inputs passed to SQL `LIKE` clauses.
