## 2026-11-08 - Cache Intl.NumberFormat in chart component
**Learning:** React charting libraries trigger tooltips continuously during mouse moves. Calling `.toLocaleString()` on every render implicitly instantiates a new `Intl.NumberFormat` each time, which can cause significant performance overhead in hot render loops.
**Action:** When formatting numbers in hot paths or frequently re-rendered components, always instantiate `Intl.NumberFormat` once outside the render loop and reuse it. Always fallback to `.toLocaleString()` when the value is not a number.
