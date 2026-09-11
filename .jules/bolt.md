## 2026-09-11 - Cache Intl.DateTimeFormat Instances in Hot Date Computation Loops

**Learning:** Instantiating `new Intl.DateTimeFormat` inside loops (e.g., slot calculations, time zone offset adjustments, date formatting) carries significant overhead (up to ~20–25ms per 100 iterations) due to C++ locale object construction in V8/JavaScriptCore. Caching `Intl.DateTimeFormat` instances in a module-level `Map` keyed by locale and options reduced slot computation duration by >93% (~15x speedup).

**Action:** Whenever formatting dates or calculating timezone offsets in tight loops or repeated functions, use a module-level cache for `Intl.DateTimeFormat` rather than constructing new formatters inline.
