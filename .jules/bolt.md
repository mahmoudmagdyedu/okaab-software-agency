## 2026-10-27 - Cache Intl.NumberFormat in Chart Components

**Learning:** Calling `toLocaleString()` on numbers inside high-frequency render loops (e.g., Recharts tooltip hover callbacks) repeatedly instantiates `Intl.NumberFormat`, causing memory allocation and garbage collection overhead.
**Action:** Module-level cached `Intl.NumberFormat` instances avoid object creation during hot tooltip renders.
