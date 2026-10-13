## 2026-10-13 - Pre-processing relational data maps in React render loops
**Learning:** Using `.find()` inside array `.map()` iterations within React component render loops leads to O(N^2) time complexity during catalog rendering. Pre-building an O(1) `Map` before render loops reduces lookup complexity to O(1).
**Action:** Pre-process relational arrays into a `Map` using `useMemo` before rendering, and ensure hooks are placed before any conditional early returns to prevent `react-hooks/rules-of-hooks` errors.
