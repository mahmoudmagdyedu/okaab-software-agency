## 2026-11-03 - Cache Intl.NumberFormat in Chart Tooltips

**Learning:** Calling `.toLocaleString()` repeatedly inside Recharts tooltip render loops creates implicit `Intl.NumberFormat` instances on every mouse movement, increasing garbage collection and render latency. Caching `Intl.NumberFormat` at module scope reduces per-item formatting overhead while safely falling back to `.toLocaleString()` for non-numeric values.
**Action:** Always cache `Intl.NumberFormat` and `Intl.DateTimeFormat` instances outside hot rendering loops and chart formatters.
