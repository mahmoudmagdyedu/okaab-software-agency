
## 2026-11-01 - Cache Intl.NumberFormat in React hot loops
**Learning:** Implicitly instantiating `Intl.NumberFormat` via `.toLocaleString()` inside hot loops (like Recharts tooltips) causes significant performance overhead.
**Action:** Always cache `Intl.NumberFormat` as a module-level constant or memoized value and reuse it, falling back to `.toLocaleString()` for non-numeric dynamic data.
