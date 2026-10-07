## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.
## 2024-05-20 - Prevent Wildcard Injection in MS SQL LIKE queries
**Vulnerability:** MS SQL Server evaluates `[` as a wildcard character in LIKE queries, which can lead to wildcard injection and DoS attacks if unescaped.
**Learning:** When sanitizing user input for MS SQL `LIKE` queries, `[` must be escaped in addition to `%` and `_`.
**Prevention:** Prevent wildcard injection and DoS attacks by escaping `[` first.
**Action:** The order of escaping is critical: `[` must be escaped first (e.g., `value.replaceAll("[", "[[]").replaceAll("%", "[%]").replaceAll("_", "[_]")`) to avoid double-escaping brackets introduced by subsequent replacements.
