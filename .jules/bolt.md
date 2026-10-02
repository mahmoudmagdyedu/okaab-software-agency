## 2025-05-18 - Pre-indexing relational data with Maps in React admin views

**Learning:** Admin schedule views with relational arrays (tasks, team assignees, profiles) cause O(N^2) render overhead when using `.find()` or `.filter()` inside render loops and callbacks.
**Action:** Pre-process relational arrays into memoized Maps/Sets outside render iterations to ensure O(1) lookups.
