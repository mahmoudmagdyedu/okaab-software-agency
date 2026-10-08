## 2025-02-23 - [Optimize Intl.DateTimeFormat Instantiation]
**Learning:** Repeatedly instantiating `Intl.DateTimeFormat` inside loop functions like `computeDaySlots` introduces a significant performance bottleneck due to the high setup cost of V8 localization objects.
**Action:** Cache and reuse `Intl.DateTimeFormat` instances globally using a Map keyed by `timeZone` and `type` to prevent redundant object creation during frequent date-time calculations.
