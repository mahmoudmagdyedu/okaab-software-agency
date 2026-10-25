## 2026-10-25 - Cache Intl.NumberFormat in Hot Chart Tooltip Rendering Loops

**Learning:** Calling `.toLocaleString()` in hot rendering loops (like Recharts hover tooltips) repeatedly instantiates `Intl.NumberFormat` under the hood, causing GC churn and frame drops.
**Action:** Module-scope cache `Intl.NumberFormat` instances without locale parameters and safely guard type checking (`typeof value === 'number' ? formatter.format(value) : value.toLocaleString()`).
