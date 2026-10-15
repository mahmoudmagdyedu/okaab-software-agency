## 2026-10-15 - Optimize Relational Lookups in React Component Render Loops

**Learning:** In React components that render relational data (such as roadmaps linked to courses), using Array.prototype.find inside a map or filter iteration results in O(N*C) time complexity. Pre-building a Map with useMemo before early returns maintains React Hooks rules while converting lookup time to O(1).
**Action:** Always pre-build a Map or Set using useMemo before early returns when cross-referencing datasets inside JSX render loops.
