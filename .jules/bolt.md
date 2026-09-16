## 2026-09-16 - Prevent O(N^2) Lookup in Arrays
**Learning:** Found an O(N^2) lookup pattern where `courses.find` was being repeatedly called inside a nested map over `roadmaps` and `links`.
**Action:** When working with relational array data that will be searched in loops, pre-process them into an O(1) Map first, then retrieve using `.get()`.
