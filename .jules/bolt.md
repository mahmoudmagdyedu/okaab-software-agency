## 2025-10-05 - Optimize Relational Array Lookups in Render Loops
**Learning:** In React components rendering large dynamic lists/grids (e.g., calendar tasks per team), using `Array.prototype.find()` repeatedly inside iteration maps creates an $O(N \times M)$ performance bottleneck.
**Action:** Pre-process relational arrays into $O(1)$ lookup Maps using `useMemo` before render iterations.
