## 2024-05-19 - Cache Intl.DateTimeFormat Instances
**Learning:** `Intl.DateTimeFormat` instantiation is notoriously expensive in JavaScript/V8. Repeatedly creating these objects in hot paths (like loops or frequently called functions such as leaderboard generation) causes unnecessary CPU overhead.
**Action:** Always cache and reuse `Intl.DateTimeFormat` instances based on their locale and options, especially when the formatting configuration is static, to avoid performance bottlenecks in server-side requests.
