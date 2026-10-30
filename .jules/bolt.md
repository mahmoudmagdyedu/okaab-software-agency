## 2026-10-30 - Caching Intl.NumberFormat in Recharts Tooltip Rendering Loop
**Learning:** Calling `toLocaleString()` on numbers inside hot rendering loops (like Recharts chart hover tooltips) creates performance overhead by repeatedly resolving locale formatting. Using a module-level cached `Intl.NumberFormat` instance improves rendering performance during chart hover interactions.
**Action:** Always cache `Intl.NumberFormat` instances at module level or via `useMemo` when formatting values in hot rendering or animation loops.
