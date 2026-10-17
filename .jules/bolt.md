## 2026-10-17 - Cache Intl.DateTimeFormat instances to prevent performance overhead

**Learning:** Repeatedly instantiating `Intl.DateTimeFormat` within hot loops or frequently called functions (like `formatTime` and `timeZoneOffsetMinutes` in `apps/mawid/src/lib/slots.ts`) introduces significant overhead. Testing showed that instantiating these inside loops took ~1.2s - ~3.8s for 10k iterations, while caching them reduced it to ~40ms - ~87ms.
**Action:** Cache `Intl.DateTimeFormat` objects in a module-level `Map` and reuse them, instead of instantiating new ones for every formatting call.
