## 2025-05-18 - Pre-process relational lookups with useMemo Maps in render loops
**Learning:** Performing repeated array `.find()` or `.filter()` operations inside React component render loops or nested `.map()` iterations leads to $O(N \times M)$ CPU overhead per render. Pre-building lookup Maps with `useMemo` defined before conditional returns eliminates array scans and restores $O(1)$ lookup performance.
**Action:** Always pre-process relational lookup collections into `useMemo` Maps before render loops, ensuring hook declarations precede any early returns.
