## 2026-10-21 - Cache Intl.NumberFormat in chart component
**Learning:** Calling `.toLocaleString()` inside high-frequency loops (like map rendering or chart tooltips) implicitly instantiates new `Intl.NumberFormat` objects on every call, causing significant performance overhead and unnecessary garbage collection.
**Action:** Always pre-instantiate `new Intl.NumberFormat()` at the module level or outside the render loop, and reuse it via `.format(value)`.
