## 2025-05-18 - O(1) Map Lookups for Relational Lists in Course Components
**Learning:** Performing array searches (`.find()` and `.filter()`) inside nested React render maps (`roadmaps.map` and `lessons.map`) creates O(N*M) time complexity bottlenecks.
**Action:** Pre-process relational arrays into O(1) Map objects using `useMemo` (defined before early returns) prior to rendering nested lists.
