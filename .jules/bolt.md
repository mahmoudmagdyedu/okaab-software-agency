## 2025-05-18 - Caching Intl Formatter Instances
**Learning:** Calling `toLocaleString`, `toLocaleDateString`, or `toLocaleTimeString` in hot formatting loops instantiates new `Intl` formatters every call, causing a ~50-70x performance overhead. Reusing cached module-level `Intl.NumberFormat` and `Intl.DateTimeFormat` instances avoids object allocation and locale parsing overhead.
**Action:** Always instantiate `Intl.NumberFormat` and `Intl.DateTimeFormat` at module scope or in a cache map for hot paths, and call `.format()`.
