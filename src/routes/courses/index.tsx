import { createFileRoute } from "@tanstack/react-router";

import { CoursesCatalog } from "@/components/courses/CourseExperience";
import { OkaabStyles, SiteFooter, SiteHeader } from "@/components/okaab/SiteChrome";
import { ThemeProvider } from "@/lib/theme";

export const Route = createFileRoute("/courses/")({
  head: () => ({
    meta: [
      { title: "كورسات البرمجة — عُقاب Okaab" },
      {
        name: "description",
        content:
          "مسارات وكورسات Frontend وBackend وFull Stack من فريق عُقاب، مرتبطة مباشرة بقناة Okaab على YouTube.",
      },
      { property: "og:title", content: "كورسات عُقاب" },
      { property: "og:url", content: "https://okaab.org/courses" },
    ],
    links: [{ rel: "canonical", href: "https://okaab.org/courses" }],
  }),
  component: CoursesPage,
});

function CoursesPage() {
  return (
    <ThemeProvider>
      <div dir="rtl" lang="ar" className="min-h-screen bg-[var(--ok-paper)] text-[var(--ok-ink)]">
        <OkaabStyles />
        <SiteHeader lang="ar" />
        <main>
          <section className="border-b-2 border-[var(--ok-ink)] paper-grain">
            <div className="ok-container py-14 sm:py-20 lg:py-24">
              <p className="text-sm font-bold text-[var(--ok-accent-text)]">تعلّم مع فريق عُقاب</p>
              <h1 className="mt-3 max-w-5xl font-display text-5xl font-bold leading-[1.05] sm:text-7xl lg:text-8xl">
                طريق واضح من أول سطر كود.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 opacity-70">
                فيديوهات عملية، Roadmaps مرتبة، وSlides تفاعلية في مكان واحد. أي فيديو جديد على
                القناة يصل هنا تلقائيًا.
              </p>
            </div>
          </section>
          <div className="ok-container py-12 sm:py-16 lg:py-20">
            <CoursesCatalog />
          </div>
        </main>
        <SiteFooter lang="ar" />
      </div>
    </ThemeProvider>
  );
}
