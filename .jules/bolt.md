## 2026-10-29 - Cache Intl.NumberFormat in Chart Tooltips

**Learning:** Calling `.toLocaleString()` inside hot rendering loops (like Recharts tooltips) repeatedly instantiates `Intl.NumberFormat`, creating performance overhead and garbage collection pressure during chart hovering and rendering.
**Action:** Module-level instantiate and reuse a single `Intl.NumberFormat` instance (with `typeof` checks and `.toLocaleString()` fallback) to ensure zero instantiation overhead per render.
