## 2026-10-15 - Optimize Relational Data Mapping in React Render
**Learning:** Inside `src/routes/admin/tasks.tsx`, using `.filter()` and `.find()` over a large relational array (`assignments`) inside another array's `.map()` (`tasks`) creates an O(N^2) complexity bottleneck, causing excessive CPU load when loading many tasks.
**Action:** Pre-process relational arrays into O(1) Maps or Sets before the `.map()` loop to achieve O(N) complexity overall, ensuring smooth rendering for large datasets.
