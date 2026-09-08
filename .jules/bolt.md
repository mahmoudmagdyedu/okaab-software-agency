## 2026-03-08 - Memoization of Landing Catalog Rows
**Learning:** Main landing page component (`OkaabLanding`) re-renders frequently due to interactive UI state changes (e.g., mobile menu toggle, quote form typing). Unmemoized transformations on locale data structures like `t.catalog.rows` cause unnecessary array allocations and mapping/filtering work on every render pass.
**Action:** Always wrap array transformation logic driven by locale/i18n dicts and localized tab selections in `useMemo` when rendering inside complex landing page components with high render frequency.
