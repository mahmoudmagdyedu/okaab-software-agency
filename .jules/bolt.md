## 2026-11-06 - Cache Intl.NumberFormat in Chart Tooltips

**Learning:** Calling `toLocaleString()` on tooltip values in Recharts components creates implicit `Intl.NumberFormat` instances on every hover/render event, introducing unnecessary object allocation and garbage collection overhead in hot animation frames.
**Action:** Define a module-level cached `Intl.NumberFormat` instance (instantiated without explicit locale arguments to respect user host environment) and format numeric values via `.format()`, retaining `.toLocaleString()` fallback for non-number types.
