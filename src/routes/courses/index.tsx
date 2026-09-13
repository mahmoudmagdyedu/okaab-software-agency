import { createFileRoute } from "@tanstack/react-router";

import { ClerkBoundary } from "@/components/auth/ClerkBoundary";
import { CoursesCatalog } from "@/components/courses/CourseExperience";
import { OkaabStyles, SiteFooter, SiteHeader } from "@/components/okaab/SiteChrome";
import { I18nProvider, useI18n } from "@/lib/i18n";
import { LEARNING_COPY, learningLanguage } from "@/lib/learning-copy";
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
      <I18nProvider>
        <ClerkBoundary>
          <CoursesContent />
        </ClerkBoundary>
      </I18nProvider>
    </ThemeProvider>
  );
}

function CoursesContent() {
  const { locale, setLocale, t } = useI18n();
  const language = learningLanguage(locale);
  const copy = LEARNING_COPY[language].catalog;
  return (
    <div
      dir={t.dir}
      lang={t.htmlLang}
      className="min-h-screen bg-[var(--ok-paper)] text-[var(--ok-ink)]"
    >
      <OkaabStyles />
      <SiteHeader lang={language} locale={locale} onLocaleChange={setLocale} showAuth />
      <main>
        <section className="border-b-2 border-[var(--ok-ink)] paper-grain">
          <div className="ok-container py-14 sm:py-20 lg:py-24">
            <p className="text-sm font-bold text-[var(--ok-accent-text)]">{copy.eyebrow}</p>
            <h1 className="mt-3 max-w-5xl font-display text-5xl font-bold leading-[1.05] sm:text-7xl lg:text-8xl">
              {copy.title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 opacity-70">{copy.intro}</p>
          </div>
        </section>
        <div className="ok-container py-12 sm:py-16 lg:py-20">
          <CoursesCatalog locale={locale} />
        </div>
      </main>
      <SiteFooter lang={language} />
    </div>
  );
}
