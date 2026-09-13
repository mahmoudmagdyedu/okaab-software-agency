import { createFileRoute } from "@tanstack/react-router";

import { ClerkBoundary } from "@/components/auth/ClerkBoundary";
import { LessonExperience } from "@/components/courses/CourseExperience";
import { OkaabStyles, SiteFooter, SiteHeader } from "@/components/okaab/SiteChrome";
import { I18nProvider, useI18n } from "@/lib/i18n";
import { learningLanguage } from "@/lib/learning-copy";
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
      <I18nProvider>
        <ClerkBoundary>
          <LessonContent courseSlug={courseSlug} lessonSlug={lessonSlug} />
        </ClerkBoundary>
      </I18nProvider>
    </ThemeProvider>
  );
}

function LessonContent({ courseSlug, lessonSlug }: { courseSlug: string; lessonSlug: string }) {
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
      <main className="ok-container py-8 sm:py-12">
        <LessonExperience courseSlug={courseSlug} lessonSlug={lessonSlug} locale={locale} />
      </main>
      <SiteFooter lang={language} />
    </div>
  );
}
