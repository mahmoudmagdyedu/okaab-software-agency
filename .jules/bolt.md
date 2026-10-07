## 2024-10-07 - Intl.DateTimeFormat instantiation overhead in hot loops
**Learning:** Repeatedly instantiating `Intl.DateTimeFormat` inside hot loops (like slot generation) causes massive performance overhead.
**Action:** Cache these instances using a Map with the time zone as the key and reuse them across function calls to avoid the overhead.
