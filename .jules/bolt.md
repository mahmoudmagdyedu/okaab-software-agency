## 2025-05-18 - Avoid O(N^2) Array Searches in React Render Loops

**Learning:** Mapping over nested lists and performing linear `.find()` calls on large arrays inside render functions creates O(N * M) performance overhead. Using `useMemo` to pre-build `Map` lookups before early returns ensures O(1) constant time resolution without hook order violation.
**Action:** Pre-process relational arrays into Maps/Sets using `useMemo` placed before conditional early returns.
