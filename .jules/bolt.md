## 2024-09-30 - Cache Intl Formatters for Performance
**Learning:** Repeatedly calling `toLocaleString`, `toLocaleDateString`, or `toLocaleTimeString` causes implicit instantiation of `Intl.NumberFormat` or `Intl.DateTimeFormat` objects, which is extremely expensive in hot loops.
**Action:** Always instantiate `Intl.NumberFormat` and `Intl.DateTimeFormat` once and reuse them for formatting numbers, dates, and times, rather than using the `toLocaleString` convenience methods.
