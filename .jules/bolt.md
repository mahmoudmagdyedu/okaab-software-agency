## 2025-05-18 - Pre-indexing relational arrays in React views
**Learning:** Performing repeated `Array.prototype.find()` and `Array.prototype.filter()` operations within render loops or map iterations creates O(N * M) time complexity bottlenecks. Converting arrays to Map lookups via `useMemo` optimizes lookup time to O(1) and eliminates redundant filter passes during render.
**Action:** Pre-process relational arrays into Maps using `useMemo` before mapping components in React routes.
