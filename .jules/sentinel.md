## 2024-05-18 - Prevent SSRF in Node.js URL resolution

**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2025-03-29 - Prevent MS SQL Server LIKE Wildcard Injection

**Vulnerability:** Parameterized MS SQL Server LIKE queries did not escape '[' characters, allowing unescaped brackets to cause pattern matching behavior or query syntax errors.
**Learning:** Standard parameterization in SQL queries prevents SQL injection but does not escape LIKE wildcard characters ('[', '%', '_'). In MS SQL Server, '[' is a wildcard bracket expression character that must be escaped first as '[[]'.
**Prevention:** Always escape '[', '%', and '_' (replacing '[' first with '[[]') when constructing parameterized LIKE query inputs.
