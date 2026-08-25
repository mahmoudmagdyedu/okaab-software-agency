import { createFileRoute } from "@tanstack/react-router";

import { CourseOverview } from "@/components/courses/CourseExperience";
import { OkaabStyles, SiteFooter, SiteHeader } from "@/components/okaab/SiteChrome";
import { ThemeProvider } from "@/lib/theme";

export const Route = createFileRoute("/courses/$courseSlug/")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.courseSlug} — كورسات عُقاب` },
      { name: "description", content: "دروس وفيديوهات وملفات الكورس على منصة عُقاب." },
    ],
    links: [{ rel: "canonical", href: `https://okaab.org/courses/${params.courseSlug}` }],
  }),
  component: CoursePage,
});

function CoursePage() {
  const { courseSlug } = Route.useParams();
  return (
    <ThemeProvider>
      <div dir="rtl" lang="ar" className="min-h-screen bg-[var(--ok-paper)] text-[var(--ok-ink)]">
        <OkaabStyles />
        <SiteHeader lang="ar" />
        <main className="ok-container py-10 sm:py-14 lg:py-16">
          <CourseOverview slug={courseSlug} />
        </main>
        <SiteFooter lang="ar" />
      </div>
    </ThemeProvider>
  );
}
