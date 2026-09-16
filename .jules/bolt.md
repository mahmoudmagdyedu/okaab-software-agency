## 2026-09-16 - Pre-process Relational Data outside Component Render Loops
**Learning:** Nested array `.find()` calls inside `.map()` loops over relational items (e.g. `links.map(link => courses.find(course => course.id === link.course_id))`) lead to $O(N \times M)$ performance bottlenecks in React components as dataset sizes grow.
**Action:** Always pre-process relational array data into an $O(1)$ lookup Map (e.g. `new Map(courses.map(c => [c.id, c]))`) using `useMemo` before rendering or mapping over nested relations.
