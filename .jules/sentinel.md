## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.
## 2026-10-27 - Prevent wildcard injection in MS SQL `LIKE` queries
**Vulnerability:** MS SQL Server uses `[` as a wildcard character for character ranges in `LIKE` queries. Failing to escape `[` before other wildcards (`%` and `_`) allows wildcard injection and potentially Denial of Service.
**Learning:** In parameterized `LIKE` queries with user input in MS SQL, replacing only `%` and `_` is insufficient. The order of replacement matters: `[` must be escaped to `[[]` *before* `%` and `_` are wrapped in brackets, otherwise the brackets used to escape `%` and `_` will be double-escaped or corrupted.
**Prevention:** Sanitize user input by chaining replacements in the correct order: `value.replaceAll("[", "[[]").replaceAll("%", "[%]").replaceAll("_", "[_]")`.
