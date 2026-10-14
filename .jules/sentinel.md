## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.
## 2026-10-14 - Fix incorrect escaping order for MS SQL LIKE query
**Vulnerability:** The input sanitization for MS SQL Server `LIKE` queries failed to escape `[` before `%` and `_`. Also missing the `[` replacement entirely in `src/routes/api/v1/admin/learners.ts`.
**Learning:** In MS SQL Server `LIKE` queries, when sanitizing user input by escaping `[`, `%`, and `_`, the order of string replacement matters. `[` must be escaped first so that the brackets added to escape `%` (as `[%]`) and `_` (as `[_]`) are not unintentionally escaped themselves.
**Prevention:** Always escape `[` first before escaping `%` and `_` when sanitizing input for parameterized MS SQL Server `LIKE` queries.
