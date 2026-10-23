## 2026-10-23 - Caching Formatters in React Render Loops
**Learning:** Calling `toLocaleString` or repeatedly instantiating `Intl.NumberFormat` within hot loops (like Recharts tooltips or React map functions) causes unnecessary garbage collection and performance overhead.
**Action:** Always instantiate formatters once outside the component (e.g., as module-level constants) and reuse them. Also, when replacing `toLocaleString` with `Intl.NumberFormat.format`, always ensure the value is a number or bigint because `format` strictly requires numeric input.
