
## 2026-10-28 - Cache Intl.NumberFormat in React hot loops
**Learning:** Calling `toLocaleString()` inside React render loops (like Recharts tooltips) creates performance overhead due to repeated formatter instantiations.
**Action:** Pre-instantiate and cache `Intl.NumberFormat` objects outside of the render cycle. When dealing with dynamic data like Recharts payloads, fallback to `.toLocaleString()` if the type isn't strictly a number, preserving both performance and type safety.
