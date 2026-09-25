## 2024-05-24 - Intl.DateTimeFormat Hot Loop Bottleneck
**Learning:** Repeatedly instantiating `Intl.DateTimeFormat` inside hot loops causes severe performance degradation.
**Action:** Always cache `Intl.DateTimeFormat` instances in a module-level Map keyed by locale/timezone options to avoid overhead.
