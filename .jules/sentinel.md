## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-09-30 - MS SQL LIKE Wildcard Sanitization
**Vulnerability:** Unescaped `[` in MS SQL `LIKE` queries allowed wildcard expansion and potential DoS or unexpected query behavior when searching.
**Learning:** MS SQL parameterization does not automatically escape `LIKE` wildcards (`%`, `_`, `[`), so user input passed to `LIKE` clauses must escape bracket characters `[` as `[[]` in addition to `%` and `_`.
**Prevention:** Sanitize user input intended for MS SQL `LIKE` queries by replacing `[` with `[[]`, `%` with `[%]`, and `_` with `[_]`.
