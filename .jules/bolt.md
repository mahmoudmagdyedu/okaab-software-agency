## 2026-11-02 - Pre-index relational entities in React admin tables

**Learning:** Rendering lists with foreign keys (such as lessons referencing courses, and videos rendering lesson dropdowns) introduces O(N*M) array find scans on every render. Pre-indexing parent entities into Maps using `useMemo` reduces lookups to O(1) and eliminates rendering lag.
**Action:** When mapping over items with foreign keys in React components, construct an O(1) lookup Map with `useMemo` before rendering loops instead of using nested `.find()`.
