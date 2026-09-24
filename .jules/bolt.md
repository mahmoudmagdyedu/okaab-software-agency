## 2025-05-18 - Pre-indexing relational catalog data in React renders
**Learning:** Performing array `.find()` lookups inside nested `.map()` loops when mapping courses to roadmaps causes O(N*M) complexity during React re-renders. Pre-indexing relational items into a Map outside the map loop reduces lookup complexity to O(1) per item.
**Action:** Always construct lookup Maps using `useMemo` for relational arrays before iterating over parent objects in render paths.
