## 2026-10-31 - MS SQL Server LIKE Query Wildcard Injection
**Vulnerability:** User input for a `LIKE` SQL query escaped `%` and `_` but failed to escape `[`, which is a character set wildcard in MS SQL Server. Also, the order of escaping is critical to avoid double escaping.
**Learning:** When sanitizing user input for MS SQL Server `LIKE` clauses, `[` must be escaped into `[[]` BEFORE escaping `%` or `_`. If `[` is escaped after, the brackets added during `%` escaping (i.e. `[%]`) will be incorrectly escaped again.
**Prevention:** Always escape `[` first, followed by `%` and `_`, when using `LIKE` with MS SQL Server (e.g. `value.replaceAll("[", "[[]").replaceAll("%", "[%]").replaceAll("_", "[_]")`).
