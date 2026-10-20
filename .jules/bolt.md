## 2026-10-20 - Cache Intl.NumberFormat in chart component
**Learning:** Implicitly instantiating `Intl.NumberFormat` in hot loops like Recharts tooltips via `.toLocaleString()` causes unnecessary object allocation overhead and GC pressure. Also, `.format()` requires strict type checking for numbers since dynamic data might be strings.
**Action:** Cache formatter instances globally and reuse them, ensuring to check `typeof value === 'number'` before formatting dynamic payload items.
