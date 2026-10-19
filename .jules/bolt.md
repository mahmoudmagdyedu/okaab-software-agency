## 2026-10-19 - Pre-processed Map lookups for relational profile lookups in admin tasks view
**Learning:** Performing repeated `Array.prototype.find()` calls inside `useMemo` search filters and item render loops creates an O(N * M) performance bottleneck when rendering task lists. Pre-indexing relational arrays into a `Map` reduces lookup time from O(N) to O(1).
**Action:** Always pre-compute a `Map` or `Set` using `useMemo` before mapping over lists or executing search filters that match foreign keys or IDs.
