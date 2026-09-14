## 2024-05-24 - React Render Loop O(N²) Arrays Over Data
**Learning:** Found O(N²) bottlenecks in `CourseExperience.tsx` where `.find` and `.filter` were being called iteratively during the component's render phases inside `.map`.
**Action:** Replace these linear lookup array operations inside render loops with O(1) Map lookups, instantiated via `useMemo` based on the data dependency array.
