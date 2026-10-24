
## 2026-10-24 - Cache Intl.NumberFormat in Recharts Tooltip
**Learning:** Recharts tooltips re-render frequently (on every mouse move) causing hot loop performance issues when `toLocaleString()` implicitly instantiates a new `Intl.NumberFormat` object repeatedly.
**Action:** Always instantiate `Intl.NumberFormat` (and `Intl.DateTimeFormat`) once outside of render loops (e.g. as a module-level constant) and reuse it. Before formatting dynamic data like Recharts payload items, ensure the value is a number using `typeof value === 'number'` to avoid runtime exceptions since `Intl.NumberFormat.format()` strictly expects numbers or bigints.
