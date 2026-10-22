## 2026-10-22 - Cache Intl.NumberFormat in ChartTooltipContent
**Learning:** Calling `.toLocaleString()` on chart payload items during hover and animation render loops implicitly creates `Intl.NumberFormat` instances on every frame. Caching a module-level `Intl.NumberFormat` instance avoids repeated instantiation and reduces hot-loop CPU overhead.
**Action:** Use a cached module-level `Intl.NumberFormat` instance when formatting numeric values in render loops, validating input types before calling `.format()`.
