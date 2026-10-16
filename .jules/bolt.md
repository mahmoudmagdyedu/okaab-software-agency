## 2026-10-16 - O(1) Map pre-processing for relational data in React render loops

**Learning:** Performing array `.find()` inside nested loops during component render creates an O(N*M) or O(R*L*C) performance bottleneck on dynamic lists. Pre-processing relational arrays into `Map` instances via `useMemo` converts lookups to O(1).
**Action:** Always pre-index relational arrays into a `Map` or object before mapping over parent arrays in React render loops, ensuring `useMemo` is placed before any early returns.
