## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-11-09 - Prevent MS SQL Server wildcard injection and DoS
**Vulnerability:** Unescaped `[` characters in user input passed to MS SQL Server `LIKE` queries allow attackers to use wildcard character classes (e.g., `[a-z]`), potentially leading to wildcard injection or DoS attacks.
**Learning:** When escaping `%` and `_` using brackets (e.g., `[%]`), the `[` character itself must be escaped first as `[[]` to prevent double-escaping the brackets introduced later and to block malicious character classes.
**Prevention:** Always sanitize MS SQL `LIKE` input by escaping `[` first: `value.replaceAll("[", "[[]").replaceAll("%", "[%]").replaceAll("_", "[_]")`.
