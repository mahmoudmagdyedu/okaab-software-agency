## 2026-11-06 - Optimize Intl.NumberFormat instantiation in Recharts tooltips
**Learning:** Repeatedly invoking `.toLocaleString()` inside React hot loops (like Recharts tooltip hover renders) creates a new `Intl.NumberFormat` instance each time, which can lead to measurable UI stuttering.
**Action:** Pre-instantiate formatters like `new Intl.NumberFormat()` at the module level and reuse `.format()`. Remember to handle dynamic types (e.g., `typeof value === 'number'`) and fallback to `.toLocaleString()` to prevent runtime type errors on unknown payload formats.
