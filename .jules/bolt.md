## 2024-05-24 - [Cache Intl.DateTimeFormat instances]
**Learning:** Instantiating `Intl.DateTimeFormat` objects in hot loops or frequently called functions can cause a significant performance overhead in date calculation.
**Action:** Always avoid repeatedly instantiating `Intl.DateTimeFormat` objects. Cache `Intl.DateTimeFormat` instances in a module-level Map keyed by locale/timezone options.
