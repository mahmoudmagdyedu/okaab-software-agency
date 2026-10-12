## 2026-10-12 - Cache Intl Formatting Objects
**Learning:** Repeatedly instantiating `Intl.DateTimeFormat` and `Intl.NumberFormat` (even implicitly via `.toLocaleString()`) in hot loops or multiple component renders creates significant performance overhead.
**Action:** Cache `Intl` instances (e.g. as module-level constants) and reuse them with `.format()` instead of calling `.toLocaleString()` inline. Note that `.toLocaleString()` includes both date and time by default, so pass explicit options when creating `Intl.DateTimeFormat` if time is needed.
