## 2026-10-12 - Reuse Intl.DateTimeFormat instances in learning platform
**Learning:** Instantiating `Intl.DateTimeFormat` on every request in backend helper functions creates unnecessary CPU overhead during date calculations. Caching module-scoped formatters reuses compiled ICU locale resources across requests.
**Action:** Cache `Intl.DateTimeFormat` and `Intl.NumberFormat` at module scope for fixed locales and timezones.
