## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2024-05-18 - Prevent MS SQL LIKE wildcard injection DoS
**Vulnerability:** MS SQL Server `LIKE` queries allow `[` as a wildcard/character class. If unescaped, it can be abused for wildcard injection or DoS.
**Learning:** When sanitizing input for parameterized MS SQL `LIKE` queries, `[` must be escaped first, followed by `%` and `_`.
**Prevention:** Always escape `[` first as `[[]`, then escape `%` as `[%]` and `_` as `[_]` to avoid double escaping.
