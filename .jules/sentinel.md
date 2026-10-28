## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.
## 2026-10-28 - Escape brackets in MS SQL LIKE wildcard queries
**Vulnerability:** MS SQL Server evaluates `[` as a wildcard character for character sets (e.g. `[a-f]`). If not escaped, user input in `LIKE` queries can trigger wildcard injection or Denial of Service.
**Learning:** When sanitizing user input for parameterized MS SQL `LIKE` queries, `[` must be escaped first, followed by `%` and `_`.
**Prevention:** Use `value.replaceAll("[", "[[]").replaceAll("%", "[%]").replaceAll("_", "[_]")` to sanitize input safely and correctly escape all wildcards.
