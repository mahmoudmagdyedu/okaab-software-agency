## 2024-05-24 - Cache Intl.DateTimeFormat instances
**Learning:** Repeatedly instantiating `Intl.DateTimeFormat` inside frequently called functions (e.g., date calculations, hot loops) introduces significant performance overhead.
**Action:** Cache `Intl.DateTimeFormat` instances in a module-level Map keyed by locale/timezone options to avoid O(N) instantiation costs on every call.
