## 2026-10-28 - Module-level Intl.NumberFormat Caching in Chart Tooltip

**Learning:** Calling `item.value.toLocaleString()` inside Recharts tooltip rendering loops causes repeated creation and garbage collection of `Intl.NumberFormat` instances during mouse hover events, leading to layout thrashing and hover latency in charts.
**Action:** Module-level instance of `Intl.NumberFormat` should be cached and reused, safely handling non-numeric payloads with a fallback.
