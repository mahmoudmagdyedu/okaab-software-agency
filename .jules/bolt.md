## 2026-10-31 - Cache Intl.NumberFormat in hot loops
**Learning:** Repeatedly instantiating `Intl.NumberFormat` (including implicitly via `.toLocaleString()`) in React hot loops like Recharts tooltips causes unnecessary performance overhead.
**Action:** Cache `Intl.NumberFormat` instances at the module level and reuse them. Always verify the value type (e.g., `typeof value === 'number'`) before formatting dynamic data to avoid runtime errors, maintaining `.toLocaleString()` as a fallback for non-numeric types.
