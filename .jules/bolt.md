## 2026-11-07 - Cache Intl.NumberFormat in tooltip render loop
**Learning:** Calling `.toLocaleString()` repeatedly inside Recharts tooltip render loops causes expensive hidden instantiations of `Intl.NumberFormat` on every mouse move and frame.
**Action:** Cache `Intl.NumberFormat` at module level without hardcoded locales and verify `typeof value === "number"` before calling `.format()`, retaining `.toLocaleString()` as fallback.
