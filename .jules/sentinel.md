## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-11-05 - Prevent MS SQL Wildcard Injection and DoS
**Vulnerability:** MS SQL `LIKE` queries allow wildcard injection if the `[` character is not escaped. This can be exploited to cause a Denial of Service (DoS) or unauthorized data discovery.
**Learning:** When sanitizing user input for parameterized MS SQL `LIKE` queries, all wildcard characters (`[`, `%`, `_`) must be escaped. The escaping order is critical: `[` must be escaped first to avoid double-escaping brackets introduced by subsequent replacements.
**Prevention:** Sanitize user input by explicitly escaping `[` first: `value.replaceAll("[", "[[]").replaceAll("%", "[%]").replaceAll("_", "[_]")`.
