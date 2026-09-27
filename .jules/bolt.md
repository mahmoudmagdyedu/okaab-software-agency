## 2025-05-15 - Cache Intl.DateTimeFormat in Hot Loops

**Learning:** Repeatedly instantiating `Intl.DateTimeFormat` inside calculation loops (such as slot availability generation) incurs significant overhead due to ICU/locale initialization. Caching `Intl.DateTimeFormat` instances in a module-level Map by locale and formatting options reduced 100 slot-engine calculations from ~12.5s to ~117ms (~100x speedup).
**Action:** Always cache `Intl.DateTimeFormat` instances in a module-level Map when formatting dates inside loops or frequent computations.
