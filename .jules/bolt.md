## 2026-10-18 - Optimize course lookup in roadmap render loop

**Learning:** Linear array searches (`.find()`) inside nested React map render loops lead to O(N\*M) quadratic overhead as catalog datasets grow. Pre-processing relational entities into a Map reduces lookup complexity to O(1).
**Action:** Convert arrays to Maps via `useMemo` for relational lookups in nested render loops.
