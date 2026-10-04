## 2026-03-30 - Caching Intl Formatter Instances in POS App
**Learning:** Repeatedly invoking `Number.prototype.toLocaleString` or `Date.prototype.toLocaleDateString`/`toLocaleTimeString` in React render loops instantiates new `Intl` formatter objects on each call, causing unnecessary GC pressure and CPU overhead in high-frequency UI updates.
**Action:** Pre-instantiate and reuse module-level `Intl.NumberFormat` and `Intl.DateTimeFormat` instances for static locale options.
