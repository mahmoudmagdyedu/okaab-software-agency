# Bolt's Performance Journal

## 2025-05-18 - Pre-process arrays into Maps to prevent O(N*M) lookups in render/filter loops
**Learning:** Performing array `.find()` inside `useMemo` filter loops or inline render functions on arrays creates O(N*M) overhead that degrades frame rates when filtering lists or rendering task assignees.
**Action:** Always pre-process relational data into a `Map<string, T>` using `useMemo` before mapping or filtering lists.
