## 2024-11-20 - Cache Intl.DateTimeFormat
**Learning:** Instantiating Intl.DateTimeFormat in a loop/frequently called function causes significant performance overhead.
**Action:** Cache Intl.DateTimeFormat instances in a module-level Map keyed by locale/timezone options to avoid repeatedly instantiating them.
