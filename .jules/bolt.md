## 2026-11-09 - Cache Intl.NumberFormat in chart tooltips

**Learning:** Instantiating `Intl.NumberFormat` implicitly via `.toLocaleString()` inside Recharts tooltip render loops creates performance overhead on every mousemove event.
**Action:** Cache `new Intl.NumberFormat()` at module level and verify `typeof value === "number"` before calling `.format()`, retaining `.toLocaleString()` in fallback.
