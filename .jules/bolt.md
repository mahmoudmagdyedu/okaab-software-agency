## 2026-10-19 - Avoid Repeated Intl Instantiations in Render Loops
**Learning:** Implicit `Intl` object instantiation via `.toLocaleString()` inside hot loops (like mapping over Recharts payload items) causes measurable performance overhead and unnecessary garbage collection.
**Action:** Cache `Intl.NumberFormat` instances at the module level and reuse them. Always verify that dynamic data is a number (e.g., `typeof value === 'number'`) before calling `.format()`.
