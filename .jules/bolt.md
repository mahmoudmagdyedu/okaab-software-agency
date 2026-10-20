## 2026-10-20 - Cache Intl.NumberFormat in Recharts Tooltip

**Learning:** Calling `toLocaleString()` or creating `Intl.NumberFormat` instances in high-frequency render loops (such as Recharts tooltip render loops on mousemove) creates performance overhead and garbage collection pressure. Caching a module-level `Intl.NumberFormat` instance eliminates repeated instantiation cost during chart interactions.
**Action:** Cache `Intl` formatter instances at module scope or in hooks when formatting dynamic numbers in chart tooltips and render loops.
