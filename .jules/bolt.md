## 2026-11-01 - Cache Intl.NumberFormat in Recharts tooltip rendering
**Learning:** Calling `item.value.toLocaleString()` inside chart tooltip renders recreates `Intl.NumberFormat` instances across high-frequency mouse move events, introducing garbage collection pressure and render overhead.
**Action:** Cache `new Intl.NumberFormat()` at module level without hardcoded locale to respect system defaults, and check `typeof value === "number"` before calling `.format()`, falling back to `.toLocaleString()`.
