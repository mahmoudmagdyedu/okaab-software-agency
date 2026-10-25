## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-10-25 - MS SQL Server LIKE query wildcard injection vulnerability
**Vulnerability:** Sanitization logic escaped `%` and `_` without escaping `[` first, leading to potential wildcard injection and DoS vulnerabilities due to MS SQL treating `[` as a wildcard pattern. Double-escaping occurs if `[` is not replaced first.
**Learning:** When constructing parameterized MS SQL Server `LIKE` queries, user input must be sanitized by escaping `[`, `%`, and `_` characters in strict order. `[` must be escaped first (`[[]`).
**Prevention:** Use `replaceAll("[", "[[]").replaceAll("%", "[%]").replaceAll("_", "[_]")` systematically for all MS SQL Server `LIKE` query user inputs to prevent wildcard injection and double-escaping issues.
