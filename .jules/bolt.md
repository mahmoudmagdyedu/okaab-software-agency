## 2025-02-12 - [Cache Intl.DateTimeFormat in Hot Loops]
**Learning:** In highly iterative slot calculation logic (e.g. `computeDaySlots`), instantiating `Intl.DateTimeFormat` for every individual format call causes significant performance degradation due to object creation overhead.
**Action:** Cache `Intl.DateTimeFormat` instances in a module-level Map keyed by locale/timezone options to reuse instances across function calls within hot paths.
