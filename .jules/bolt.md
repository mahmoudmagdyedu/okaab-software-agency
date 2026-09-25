## 2025-05-20 - Caching Intl.DateTimeFormat Instances
**Learning:** Creating `Intl.DateTimeFormat` instances inside loops during date formatting or timezone offset calculations causes severe execution slowdowns due to costly internal ICU data initialization.
**Action:** Cache `Intl.DateTimeFormat` instances in a module-level Map keyed by locale and options string.
