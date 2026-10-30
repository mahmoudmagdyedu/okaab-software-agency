## 2026-10-30 - Cache Intl.NumberFormat in React hot paths
**Learning:** Implicitly instantiating `Intl.NumberFormat` by calling `.toLocaleString()` inside hot React render loops (like Recharts tooltips) causes significant performance overhead due to repeated object creation.
**Action:** Cache `new Intl.NumberFormat()` at the module level and reuse it. Always preserve `.toLocaleString()` as a fallback for non-numeric data to prevent UI breakage.
