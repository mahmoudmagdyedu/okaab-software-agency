## 2026-10-31 - Cache Intl.NumberFormat in Recharts Tooltip Rendering

**Learning:** Calling `toLocaleString()` directly in Recharts tooltip item rendering loops incurs unnecessary object allocation and locale resolution on every hover event. Caching a module-level `Intl.NumberFormat` avoids repeated instantiations while preserving default locale formatting.
**Action:** Always cache `Intl.NumberFormat` instances at module level when formatting numbers in tight rendering loops or frequently rendered UI components like chart tooltips.
