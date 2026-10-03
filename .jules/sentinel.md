## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2024-10-03 - Prevent Wildcard Injection in MS SQL Server LIKE queries
**Vulnerability:** Standard parameterization does not automatically escape `LIKE` wildcards (`[`, `%`, `_`), allowing attackers to craft wildcard patterns that cause Denial of Service (DoS) via expensive queries or unintended data exposure.
**Learning:** User input used in MS SQL Server `LIKE` clauses must be sanitized by escaping the wildcard characters, specifically replacing `[` with `[[]`, before being parameterized.
**Prevention:** Always escape `[`, `%`, and `_` (e.g., using `replaceAll("[", "[[]")`) in user input before passing it as a parameter to a `LIKE` clause.
