## 2024-10-03 - Cache Intl Formatters for Performance
**Learning:** Implicitly instantiating `Intl` objects via `toLocaleString` methods inside hot loops or frequently called utility functions introduces significant performance overhead, especially in POS applications dealing with many items and timestamps.
**Action:** Always pre-initialize and cache `Intl.NumberFormat` and `Intl.DateTimeFormat` instances as module-level constants and reuse their `.format()` methods instead of relying on `.toLocaleString()` and friends.
