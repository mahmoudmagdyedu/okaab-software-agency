## 2026-11-09 - Cache Intl.NumberFormat in Chart Tooltips
**Learning:** Calling `.toLocaleString()` on every item in a Recharts hot rendering loop repeatedly instantiates a new `Intl.NumberFormat` object, creating a measurable performance bottleneck.
**Action:** Cache a single `Intl.NumberFormat` instance (e.g. `new Intl.NumberFormat()`) as a module-level constant and reuse its `.format()` method, ensuring to check `typeof value === 'number'` with a fallback to `.toLocaleString()` for non-numeric types.
