## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-11-03 - Prevent MS SQL Server Wildcard Injection
**Vulnerability:** MS SQL Server evaluates `[` as a wildcard character when used with `LIKE`. Failing to escape it allows malicious input to cause unexpected behavior or Denial of Service (DoS) due to expensive wildcard matching. Escaping `[` must happen before escaping `%` and `_` to avoid double-escaping.
**Learning:** When sanitizing user input for MS SQL Server parameterized `LIKE` queries, `[`, `%`, and `_` must all be escaped.
**Prevention:** Ensure the order of escaping is correct: `value.replaceAll("[", "[[]").replaceAll("%", "[%]").replaceAll("_", "[_]")`.
