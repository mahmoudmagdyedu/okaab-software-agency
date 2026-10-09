## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2024-05-20 - Prevent MS SQL Server LIKE wildcard injection
**Vulnerability:** MS SQL Server evaluates `[` as a wildcard character for sets in `LIKE` queries, allowing wildcard injection and DoS attacks if user input is not fully sanitized.
**Learning:** User input used in parameterized `LIKE` queries must be sanitized by escaping `[`, `%`, and `_`. The order of escaping is critical: `[` must be escaped first to avoid double-escaping brackets introduced by subsequent replacements.
**Prevention:** Sanitize user input by escaping `[` first, followed by `%` and `_` (e.g., `value.replaceAll("[", "[[]").replaceAll("%", "[%]").replaceAll("_", "[_]")`).
