## 2026-10-04 - Cache Intl formatters for hot loop performance
**Learning:** Repeatedly instantiating `Intl.DateTimeFormat` and `Intl.NumberFormat` (even implicitly via `toLocaleString` or `toLocaleDateString`) causes significant performance overhead in hot loops (e.g. rendering long lists or tables).
**Action:** Cache these instances once as module-level constants and reuse them to improve formatting speed and reduce unnecessary object allocations.
