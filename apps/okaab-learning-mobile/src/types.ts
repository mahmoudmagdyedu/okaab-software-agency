export type Progress = { lesson_id: string; status: "not_started" | "in_progress" | "completed"; last_slide: number; video_percent: number; quiz_score: number };
export type Course = { id: string; slug: string; title: string; description: string; cover_url: string | null; level: string };
export type Lesson = { id: string; course_id: string; slug: string; title: string; description: string; sort_order: number };
export type Roadmap = { id: string; slug: string; title: string; description: string; cover_url: string | null };
export type Catalog = { roadmaps: Roadmap[]; courses: Course[]; roadmapCourses: { roadmap_id: string; course_id: string; sort_order: number }[]; lessons: Lesson[]; progress: Progress[] };
export type Overview = { profile: { display_name: string; avatar_url: string | null; email: string }; points: number; rank: number | null; streak: { current_days: number; longest_days: number }; continueLearning: { slug: string; title: string; course_slug: string } | null };
