## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.
## 2026-10-20 - MS SQL Server LIKE Query Wildcard Injection
**Vulnerability:** User input used in MS SQL `LIKE` queries was not escaping the `[` character, allowing attackers to inject wildcards and potentially cause DoS attacks or unauthorized data discovery.
**Learning:** When using MS SQL Server, `[` is a wildcard character for character ranges. It must be escaped as `[[]` before escaping `%` and `_` to avoid double-escaping issues.
**Prevention:** Always escape `[`, `%`, and `_` characters in that specific order when constructing parameterized MS SQL Server `LIKE` queries.
