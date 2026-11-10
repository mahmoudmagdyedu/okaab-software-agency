## 2026-11-10 - Cache Intl.NumberFormat in chart component

**Learning:** Recharts tooltip render loops execute repeatedly on mouse movements; calling `.toLocaleString()` inside tooltip rendering implicitly instantiates `Intl.NumberFormat` repeatedly, causing high memory churn and frame drops.
**Action:** Cache `Intl.NumberFormat` instances at module scope and check `typeof value === "number"` before formatting, falling back to `.toLocaleString()` for non-numeric types.
