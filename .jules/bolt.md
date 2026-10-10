## 2024-05-24 - Cache Intl.DateTimeFormat objects to prevent performance overhead
**Learning:** Repeatedly instantiating `Intl.DateTimeFormat` objects inside loops (e.g., in functions like `formatTime`, `formatDateKey`, or `timeZoneOffsetMinutes` in `slots.ts`) causes significant performance overhead and O(N^2) bottlenecks when calculating slot availability for an entire day across multiple days or rules.
**Action:** Cache these instances using a `Map` (keyed by `timeZone` and format options) and reuse them instead of creating a new instance every time the function is called.
