import { createFileRoute } from "@tanstack/react-router";

import { ClerkBoundary } from "@/components/auth/ClerkBoundary";
import { CourseOverview } from "@/components/courses/CourseExperience";
import { OkaabStyles, SiteFooter, SiteHeader } from "@/components/okaab/SiteChrome";
import { I18nProvider, useI18n } from "@/lib/i18n";
import { learningLanguage } from "@/lib/learning-copy";
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
      <I18nProvider>
        <ClerkBoundary>
          <CourseContent courseSlug={courseSlug} />
        </ClerkBoundary>
      </I18nProvider>
    </ThemeProvider>
  );
}

function CourseContent({ courseSlug }: { courseSlug: string }) {
  const { locale, setLocale, t } = useI18n();
  const language = learningLanguage(locale);
  return (
    <div
      dir={t.dir}
      lang={t.htmlLang}
      className="min-h-screen bg-[var(--ok-paper)] text-[var(--ok-ink)]"
    >
      <OkaabStyles />
      <SiteHeader lang={language} locale={locale} onLocaleChange={setLocale} showAuth />
      <main className="ok-container py-10 sm:py-14 lg:py-16">
        <CourseOverview slug={courseSlug} locale={locale} />
      </main>
      <SiteFooter lang={language} />
    </div>
  );
}
