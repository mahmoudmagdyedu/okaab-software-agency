## 2026-10-24 - Cache Intl.NumberFormat in Chart Tooltip Rendering

**Learning:** Calling `toLocaleString()` or creating `Intl.NumberFormat` repeatedly inside hot tooltip/chart rendering loops creates performance overhead from object instantiation.
**Action:** Instantiate `Intl.NumberFormat` once as a module-level constant without locale arguments and reuse it via `.format()`.
