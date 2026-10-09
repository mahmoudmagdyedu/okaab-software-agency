## 2026-10-09 - Cache Intl formatting objects to prevent performance overhead in loops
**Learning:** Repeatedly instantiating Intl.DateTimeFormat and Intl.NumberFormat objects (including implicitly via toLocaleString, toLocaleDateString, or toLocaleTimeString) inside React render loops or other hot paths causes significant performance overhead.
**Action:** Cache these instances once (e.g., as module-level constants or via useMemo) and reuse them with the .format() method to avoid slow re-instantiation.
