# Bolt's Journal - Critical Learnings

## 2026-08-24 - Intl.DateTimeFormat Instantiation Bottleneck in Timezone Slot Engine
**Learning:** Creating new `Intl.DateTimeFormat` instances on every date/time calculation (e.g. in loops or frequent function calls like `timeZoneOffsetMinutes` and `formatTime`) incurs substantial CPU overhead in JavaScript runtimes (V8/JavaScriptCore). Caching `Intl.DateTimeFormat` instances by locale and configuration key improves slot computation runtime by >50x (~56,000ms -> ~1,100ms for 1,000 runs).
**Action:** Always reuse `Intl.DateTimeFormat` instances via a memoized/cached helper function when performing timezone or date formatting in loop-heavy or high-frequency utilities.
