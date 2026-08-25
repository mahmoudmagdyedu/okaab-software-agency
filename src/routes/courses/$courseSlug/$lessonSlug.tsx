import { createFileRoute } from "@tanstack/react-router";

import { LessonExperience } from "@/components/courses/CourseExperience";
import { OkaabStyles, SiteFooter, SiteHeader } from "@/components/okaab/SiteChrome";
import { ThemeProvider } from "@/lib/theme";

export const Route = createFileRoute("/courses/$courseSlug/$lessonSlug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.lessonSlug} — منصة عُقاب` },
      { name: "description", content: "فيديو وSlides الدرس على منصة عُقاب." },
    ],
    links: [
      {
        rel: "canonical",
        href: `https://okaab.org/courses/${params.courseSlug}/${params.lessonSlug}`,
      },
    ],
  }),
  component: LessonPage,
});

function LessonPage() {
  const { courseSlug, lessonSlug } = Route.useParams();
  return (
    <ThemeProvider>
      <div dir="rtl" lang="ar" className="min-h-screen bg-[var(--ok-paper)] text-[var(--ok-ink)]">
        <OkaabStyles />
        <SiteHeader lang="ar" />
        <main className="ok-container py-8 sm:py-12">
          <LessonExperience courseSlug={courseSlug} lessonSlug={lessonSlug} />
        </main>
        <SiteFooter lang="ar" />
      </div>
    </ThemeProvider>
  );
}
