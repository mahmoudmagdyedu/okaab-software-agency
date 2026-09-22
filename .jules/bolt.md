## 2024-05-14 - Cache Intl.DateTimeFormat instances
**Learning:** Avoid repeatedly instantiating `Intl.DateTimeFormat` objects in hot loops as it causes a performance overhead.
**Action:** Cache `Intl.DateTimeFormat` instances in a module-level Map keyed by locale/timezone options.
