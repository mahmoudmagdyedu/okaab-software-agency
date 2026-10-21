## 2026-10-21 - Cache Intl.NumberFormat in Chart Components

**Learning:** Using `toLocaleString()` inside chart tooltip hot render loops repeatedly instantiates `Intl.NumberFormat` instances under the hood, causing GC churn and render delays.
**Action:** Cache `Intl.NumberFormat` instances as module-level singletons when formatting numbers in components that render frequently.
