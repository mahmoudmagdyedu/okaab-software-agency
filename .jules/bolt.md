## 2026-10-26 - Cache Intl.NumberFormat in Chart Tooltips

**Learning:** Recharts tooltip items render repeatedly during cursor movement over charts. Calling `.toLocaleString()` in every render frame dynamically instantiates `Intl.NumberFormat`, creating CPU overhead in chart rendering hot loops.
**Action:** Pre-instantiate a module-level `Intl.NumberFormat` instance and use `.format()` while safely retaining `.toLocaleString()` as a fallback for non-numeric types.
