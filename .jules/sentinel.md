## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2025-05-18 - Fix MS SQL Server LIKE wildcard injection
**Vulnerability:** Unescaped `[` brackets in user input passed to MS SQL Server `LIKE` queries allow attacker-controlled pattern matching / character sets, bypassing expected literal search semantics.
**Learning:** Escaping `%` and `_` before `[` or neglecting `[` allows attackers to inject MS SQL bracket wildcards or causes double-escaping.
**Prevention:** Always escape `[` first using `value.replaceAll("[", "[[]").replaceAll("%", "[%]").replaceAll("_", "[_]")` before passing user input into SQL `LIKE` parameter bindings.
