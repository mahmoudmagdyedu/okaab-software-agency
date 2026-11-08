## 2026-11-08 - Cache Intl.NumberFormat in Recharts tooltip hot path

**Learning:** Calling `toLocaleString()` on tooltip payload values in Recharts triggers repeated, expensive `Intl.NumberFormat` instantiations during frequent mouse movements over chart series.
**Action:** Reuse a module-level cached `Intl.NumberFormat` instance (instantiated without explicit locale to preserve host defaults), and verify `typeof value === 'number'` before formatting while retaining `toLocaleString()` fallback for non-numeric payloads.
