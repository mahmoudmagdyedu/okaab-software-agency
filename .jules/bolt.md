## 2026-10-23 - Cache Intl.NumberFormat instance in ChartTooltipContent

**Learning:** Repeated calls to `.toLocaleString()` inside hot render loops (such as Recharts tooltip renderers) implicitly instantiate new `Intl.NumberFormat` objects on every frame update, causing garbage collection spikes and CPU overhead.
**Action:** Replace dynamic `.toLocaleString()` calls in UI components with a shared module-level `new Intl.NumberFormat()` instance.
