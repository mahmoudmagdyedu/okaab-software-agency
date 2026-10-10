## 2025-05-18 - Pre-process Relational Arrays to O(1) Maps in React Components

**Learning:** Performing array `.find()` lookups inside nested `.map()` loops over relational entities creates O(N^2) complexity on every render. Creating an O(1) Map via `useMemo` before rendering eliminates redundant iterations and improves render performance.

**Action:** Always pre-process relational array lookups into Map instances using `useMemo` defined above early returns in React components.
