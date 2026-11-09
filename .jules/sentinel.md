## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-11-09 - Prevent MS SQL Server Wildcard Injection
**Vulnerability:** Constructing MS SQL `LIKE` queries with user input without properly escaping the `[` character can lead to wildcard injection. Because `[` is a wildcard character in MS SQL, failing to escape it, or escaping it after escaping `%` and `_` with brackets (e.g., `[%]`), causes double-escaping and allows attackers to perform complex pattern matching leading to DoS.
**Learning:** When escaping MS SQL `LIKE` query wildcards (`[`, `%`, `_`), the order of replacement is critical. `[` must be escaped first as `[[]` before wrapping other wildcards in brackets.
**Prevention:** Always escape `[` first when sanitizing user input for MS SQL `LIKE` queries: `value.replaceAll("[", "[[]").replaceAll("%", "[%]").replaceAll("_", "[_]")`.
