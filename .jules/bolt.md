## 2024-05-17 - [React Render Loop Bottleneck]
**Learning:** In React components dealing with relational data, repeatedly calling `.find()`, `.filter()`, or `.some()` inside nested loops or `map` iterations causes O(N^2) performance bottlenecks on render.
**Action:** Pre-process arrays into O(1) Maps or Sets outside of render loops (often with `useMemo`) before doing the iteration. Be careful to define `useMemo` hooks before any early returns (like loading state checks) to avoid `react-hooks/rules-of-hooks` errors.
