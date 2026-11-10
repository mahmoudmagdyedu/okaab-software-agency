## 2026-11-10 - Cache Intl.NumberFormat in rendering loops
**Learning:** Implicitly instantiating `Intl.NumberFormat` objects via `.toLocaleString()` inside hot rendering loops (like chart tooltips) causes significant performance overhead.
**Action:** Cache these instances once at the module level (e.g., `new Intl.NumberFormat()`) and reuse them. Always fallback to `.toLocaleString()` for non-numeric values.
