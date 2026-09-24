## 2024-03-20 - [Performance Issue]
**Learning:** Initial Learning.
**Action:** Initial Action.

## 2025-02-24 - Cache Intl.DateTimeFormat in date calculation hot loops
**Learning:** Repeatedly instantiating `Intl.DateTimeFormat` objects in hot loops (such as mapping over relational data or generating slots) introduces significant performance overhead in Node/Bun/Browsers due to costly underlying native object initialization.
**Action:** Always cache `Intl.DateTimeFormat` instances in a module-level Map keyed by locale/timezone options to prevent O(N) instantiation costs in render loops and data mapping operations.
