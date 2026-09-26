## 2025-05-18 - Intl.DateTimeFormat Caching in Time-Slot Engine

**Learning:** Repeatedly creating `Intl.DateTimeFormat` instances inside hot calculation loops (e.g., slot generation) causes severe CPU overhead (~98ms per `computeDaySlots` call). Caching `Intl.DateTimeFormat` instances reduces execution time by over 95%.
**Action:** Always cache `Intl.DateTimeFormat` instances at module level when used in hot functions or loops.
