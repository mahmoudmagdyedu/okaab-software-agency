## 2025-05-15 - Cache Intl.DateTimeFormat in Slot Calculation Engine
**Learning:** Instantiating `Intl.DateTimeFormat` inside loops in V8 creates significant CPU overhead due to underlying C++/ICU object initialization. `Intl.DateTimeFormat.format` is stateless, making it safe to cache by timezone and formatting options.
**Action:** Always cache `Intl.DateTimeFormat` instances using a Map when date formatting or timezone offset calculations are invoked repeatedly in loops or hot code paths.
