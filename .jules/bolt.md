## 2026-10-14 - Cache module-level Intl.DateTimeFormat instances
**Learning:** Instantiating `Intl.DateTimeFormat` on every function execution causes significant performance overhead in hot server paths. Caching instances at module scope eliminates redundant parsing and initialization overhead.
**Action:** Always extract static `Intl.DateTimeFormat` configurations to module-level constants or static caches.
