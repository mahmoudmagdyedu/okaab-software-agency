## 2026-11-04 - Cache Intl.NumberFormat in Recharts tooltips
**Learning:** Calling `.toLocaleString()` on dynamic data like Recharts payload items inside hot rendering loops (such as tooltips) repeatedly instantiates `Intl.NumberFormat` objects, causing significant performance overhead.
**Action:** Cache `Intl.NumberFormat` instances once as module-level constants and reuse them. Always verify the value type (e.g., `typeof value === 'number'`) before calling `.format()`, falling back to `.toLocaleString()` to safely handle non-numeric payload types.
