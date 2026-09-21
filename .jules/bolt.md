## 2024-05-14 - [Cache Intl.DateTimeFormat to Avoid Hot Loop Bottlenecks]
**Learning:** `Intl.DateTimeFormat` instantiation is extremely slow in Node/V8 and creating it inside loops (e.g. `computeDaySlots`) causes severe performance degradation (~67s for 1000 iterations).
**Action:** Cache `Intl.DateTimeFormat` instances in a module-level Map keyed by locale and timezone options to prevent O(N) instantiations in date calculation hot loops.
