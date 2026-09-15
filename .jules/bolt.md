## 2026-09-15 - Memoizing Dropdown Options and Lookups in Admin Views

**Learning:** Admin management components rendering lists of items (e.g. up to 100 YouTube videos) with nested select dropdowns (e.g. lessons and courses) can perform tens of thousands of array iterations (`.find()`) on every render if options and titles are computed inline inside `.map()`.
**Action:** Always precompute formatted select options with `useMemo` and use `Map` structures for `id -> entity` lookups when rendering nested entity relations in React list views.
