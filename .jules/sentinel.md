## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-10-29 - SQL Wildcard Injection via Double-Escaping Brackets
**Vulnerability:** MS SQL Server `LIKE` queries with user input are vulnerable to wildcard injection if `[`, `%`, and `_` are not properly escaped. When sanitizing these characters by wrapping them in brackets (e.g., `[%]`), escaping `[` after escaping other wildcards (or not escaping it at all) leads to wildcard injection and DoS.
**Learning:** The order of escaping is critical. The `[` character must always be escaped first (i.e., `replaceAll("[", "[[]")`) before `%` and `_`, to prevent double-escaping the brackets introduced by the subsequent wildcard replacements.
**Prevention:** Enforce a strict escaping order `value.replaceAll("[", "[[]").replaceAll("%", "[%]").replaceAll("_", "[_]")` whenever parameterizing MS SQL Server `LIKE` clauses with user input.
