## 2025-05-15 - Caching Intl.DateTimeFormat in Slot Calculation Loops

**Learning:** Repeatedly instantiating `Intl.DateTimeFormat` inside date calculation loops (like `computeDaySlots`) causes severe CPU overhead and slows down calculations by orders of magnitude (~90x slower).

**Action:** Cache `Intl.DateTimeFormat` instances using a module-level Map keyed by locale and options string representation whenever formatting in repeated operations or hot loops.
