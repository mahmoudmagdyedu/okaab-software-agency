## 2026-11-11 - Cache Intl.NumberFormat in Recharts Tooltip
**Learning:** Calling `.toLocaleString()` on numbers inside hot rendering loops like chart tooltips repeatedly instantiates `Intl.NumberFormat` objects, causing unnecessary performance overhead.
**Action:** Cache a module-level `Intl.NumberFormat` instance without locale arguments and reuse it via `formatter.format(value)` when rendering numeric payload items, maintaining `.toLocaleString()` as a fallback for non-numeric types.
