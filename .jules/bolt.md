
## 2026-10-18 - Intl.DateTimeFormat Instantiation Bottleneck in Hot Loops
**Learning:** Repeatedly instantiating `Intl.DateTimeFormat` inside hot loops (like processing thousands of slots) causes significant performance degradation.
**Action:** Cache these instances once (e.g., using a Map) and reuse them. Also, validate that the parsed `Date` object is valid before calling `.format()` to prevent `RangeError` exceptions.
