## 2026-11-04 - Cache Intl.NumberFormat in Recharts tooltip hot loops

**Learning:** Recharts tooltip content renders on every mousemove and animation frame. Calling `.toLocaleString()` repeatedly inside the tooltip item loop instantiates `Intl.NumberFormat` on each render pass, creating measurable GC pressure and CPU overhead.
**Action:** Always hoist `Intl.NumberFormat` to module scope or cache it when formatting numeric values in chart tooltips and high-frequency render loops.
