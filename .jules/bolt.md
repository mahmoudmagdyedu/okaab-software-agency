## 2026-11-11 - Cache Intl.NumberFormat in Recharts tooltip

**Learning:** Calling `.toLocaleString()` repeatedly on chart data points inside hot rendering loops like Recharts tooltips causes unnecessary overhead from repeatedly instantiating formatter instances. Caching a module-level `Intl.NumberFormat` without hardcoded locales avoids this overhead while preserving system defaults.
**Action:** Reuse module-level `Intl.NumberFormat` instances and guard with `typeof value === "number"` falling back to `value.toLocaleString()` for non-numeric types.
