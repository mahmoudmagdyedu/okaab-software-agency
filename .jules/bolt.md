## 2025-05-18 - Cache Intl.DateTimeFormat instances at module level
**Learning:** Re-instantiating `Intl.DateTimeFormat` inside server functions (like `touchDailyStreak` and `getLeaderboard`) causes unnecessary CPU overhead per invocation because ICU data initialization is costly.
**Action:** Always instantiate `Intl.DateTimeFormat` once at module scope or cache instances in a map when options are constant.
