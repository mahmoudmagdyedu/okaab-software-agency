## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-10-17 - Prevent MS SQL Wildcard Injection and DoS
**Vulnerability:** MS SQL `LIKE` operator evaluates `[` as a wildcard. Escaping only `%` and `_`, or escaping `[` after `%` and `_`, allows wildcard injection or DoS via double-escaped brackets.
**Learning:** When sanitizing user input for MS SQL `LIKE` queries, `[` must be escaped first (e.g., `replaceAll("[", "[[]")`) to prevent double-escaping the brackets added by subsequent `%` and `_` escaping.
**Prevention:** Always escape `[` first using `.replaceAll("[", "[[]")`, followed by `.replaceAll("%", "[%]")` and `.replaceAll("_", "[_]")`.
