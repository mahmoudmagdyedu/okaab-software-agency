## 2026-10-17 - Pre-process Relational Course Lookups with O(1) Map
**Learning:** Performing array `.find()` lookups inside nested `.map()` loops over relational catalog data causes $O(R \times L \times C)$ performance overhead during component renders.
**Action:** Pre-process relational arrays into $O(1)$ `Map` structures inside `useMemo` hooks declared before early returns.
