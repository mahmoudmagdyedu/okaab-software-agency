## 2024-05-18 - Prevent SSRF in Node.js URL resolution

**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-11-03 - Escape MS SQL LIKE wildcard brackets before percent and underscore

**Vulnerability:** Incomplete MS SQL LIKE pattern escaping allowed unescaped opening brackets `[` to trigger pattern matching and character range parsing, potentially enabling wildcard injection or DoS.
**Learning:** In MS SQL Server LIKE queries, `[` is a pattern-matching wildcard character. If not escaped, or if escaped after `%` or `_`, it can cause unexpected search behavior or double-escaping.
**Prevention:** Always escape `[` first as `[[]`, followed by `%` as `[%]` and `_` as `[_]` when sanitizing user search input for parameterized MS SQL LIKE queries.
