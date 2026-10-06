## 2024-11-20 - [Intl.DateTimeFormat Caching Optimization]
**Learning:** Instantiating `Intl.DateTimeFormat` objects is an expensive operation that can cause significant performance overhead if done repeatedly in hot paths like streaks processing or leaderboard building.
**Action:** Cache `Intl.DateTimeFormat` and `Intl.NumberFormat` instances as module-level constants or reuse them instead of instantiating new objects on every request or loop iteration.
