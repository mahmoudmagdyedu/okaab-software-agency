## 2024-05-18 - Prevent SSRF in Node.js URL resolution
**Vulnerability:** Node.js URL constructor evaluates paths starting with `//` or `/\` as protocol-relative URLs, leading to Server-Side Request Forgery (SSRF) when used with `new URL(path, base)`.
**Learning:** Path strings provided by user input must be sanitized before passing as the path segment in `new URL(path, base)` to prevent malicious domain redirection.
**Prevention:** Prevent SSRF by aggressively stripping leading slashes and backslashes (e.g., `path.replace(/^[/\\]+/, '')`) before URL construction.

## 2026-10-25 - Prevent MS SQL Wildcard Injection
**Vulnerability:** User input used in MS SQL Server `LIKE` queries was not fully sanitized. The `[` character was not escaped, allowing attackers to inject character set wildcards (e.g., `[a-z]`), potentially leading to DoS via expensive queries or unintended data discovery.
**Learning:** When escaping MS SQL wildcards, the order of replacement is critical. The bracket `[` must be escaped first as `[[]` to prevent double-escaping the brackets introduced by subsequent replacements for `%` and `_`.
**Prevention:** Always escape `[`, `%`, and `_` in that exact order (e.g., `value.replaceAll("[", "[[]").replaceAll("%", "[%]").replaceAll("_", "[_]")`) when constructing parameterized `LIKE` query inputs.
