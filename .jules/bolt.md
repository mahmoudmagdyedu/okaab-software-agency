## 2024-05-24 - Cache Intl Formatting Instances
**Learning:** Repeatedly instantiating `Intl.DateTimeFormat` objects inside API functions causes significant CPU overhead on the backend because of the cost of setting up locale data in V8 (approx 0.17ms per initialization).
**Action:** Always cache and reuse `Intl.DateTimeFormat` and `Intl.NumberFormat` instances as module-level constants to avoid repeated expensive instantiations.
