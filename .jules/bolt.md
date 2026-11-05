## 2026-11-05 - Cache Intl.NumberFormat in Chart Tooltips
**Learning:** Calling `.toLocaleString()` repeatedly inside Recharts tooltip render loops causes significant performance overhead due to implicit `Intl.NumberFormat` instantiation on every hover event.
**Action:** Cache `Intl.NumberFormat` instances at module level and verify `typeof value === "number"` before invoking `.format()`, retaining `.toLocaleString()` as fallback for non-numeric values.
