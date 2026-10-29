
## 2026-10-29 - Cache Intl.NumberFormat in Recharts hot loops
**Learning:** Using `.toLocaleString()` repeatedly inside Recharts tooltip rendering loops causes unnecessary performance overhead due to the repeated instantiation of `Intl.NumberFormat` under the hood.
**Action:** Instantiate a single `new Intl.NumberFormat()` at the module level and reuse it to format numeric values inside hot rendering loops. Ensure fallback handling is present since dynamic payloads may contain non-numeric types.
