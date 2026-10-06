## 2025-05-18 - Relational Data Pre-processing in CoursesCatalog

**Learning:** Mapping relational array links inside render loops without memoization or Map indexing causes quadratic O(N^2) performance overhead. Placing `useMemo` hooks before early returns prevents React hook rule violations while caching O(1) Map lookups across renders.

**Action:** Pre-process relational arrays into Maps/Sets within `useMemo` declared before any early return statements in React components.
