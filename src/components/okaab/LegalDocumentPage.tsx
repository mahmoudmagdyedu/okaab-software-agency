import { OkaabStyles, SiteFooter, SiteHeader } from "@/components/okaab/SiteChrome";
import type { LegalDocumentCopy, LegalLanguage } from "@/content/legal";
import { LEGAL_IDENTITY } from "@/content/legal";
import { ThemeProvider } from "@/lib/theme";
import { useDocumentLanguage } from "@/lib/use-document-language";

export function LegalDocumentPage({
  lang,
  copy,
  slug,
}: {
  lang: LegalLanguage;
  copy: LegalDocumentCopy;
  slug: "terms" | "privacy";
}) {
  const rtl = lang === "ar";
  useDocumentLanguage(lang);
  const otherLanguagePath = lang === "ar" ? `/en/${slug}` : `/${slug}`;
  return (
    <ThemeProvider>
      <div
        dir={rtl ? "rtl" : "ltr"}
        lang={lang}
        className="min-h-screen bg-[var(--ok-paper)] text-[var(--ok-ink)]"
      >
        <OkaabStyles />
        <SiteHeader lang={lang} />

        <main className="ok-container py-12 sm:py-16 lg:py-20">
          <article className="mx-auto max-w-5xl">
            <p className="mb-3 text-sm font-semibold text-[var(--ok-accent-text)]">
              {copy.eyebrow}
            </p>
            <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl">
              {copy.title}
            </h1>
            <p className="mt-5 max-w-4xl text-base leading-8 text-[var(--ok-ink)]/75 sm:text-lg">
              {copy.intro}
            </p>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[var(--ok-ink)]/60">
              <span>{copy.updatedLabel}</span>
              <span dir="ltr">{copy.versionLabel}</span>
              <a
                href={otherLanguagePath}
                hrefLang={lang === "ar" ? "en" : "ar"}
                className="font-semibold text-[var(--ok-accent-text)] underline underline-offset-4"
              >
                {lang === "ar" ? "English" : "العربية"}
              </a>
            </div>

            <aside className="mt-8 rounded-3xl border-2 border-[var(--ok-ink)] bg-[var(--ok-paper-2)] p-5 text-sm leading-7 text-[var(--ok-ink)]/75">
              {copy.notice}
            </aside>

            <nav
              aria-label={rtl ? "فهرس الصفحة" : "Page contents"}
              className="mt-8 rounded-3xl border-2 border-[var(--ok-ink)]/20 p-5"
            >
              <p className="font-display text-lg font-bold">{rtl ? "المحتويات" : "Contents"}</p>
              <ol className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                {copy.sections.map((section, index) => (
                  <li key={section.title}>
                    <a
                      className="accent-link underline-offset-4 hover:underline"
                      href={`#section-${index + 1}`}
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            <div className="mt-10 divide-y-2 divide-[var(--ok-ink)]/15 border-y-2 border-[var(--ok-ink)]">
              {copy.sections.map((section, index) => (
                <section
                  id={`section-${index + 1}`}
                  key={section.title}
                  className="scroll-mt-28 grid gap-4 py-8 sm:grid-cols-[240px_1fr] sm:gap-9"
                >
                  <h2 className="font-display text-2xl font-bold leading-tight">{section.title}</h2>
                  <div className="space-y-4 text-sm leading-7 text-[var(--ok-ink)]/80 sm:text-base">
                    {section.paragraphs?.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                    {section.bullets ? (
                      <ul className="space-y-3">
                        {section.bullets.map((item) => (
                          <li key={item} className="flex gap-3">
                            <span
                              aria-hidden
                              className="mt-3 size-1.5 shrink-0 rounded-full bg-[var(--ok-accent-text)]"
                            />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </section>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href={`mailto:${LEGAL_IDENTITY.email}`}
                className="inline-flex rounded-full border-2 border-[var(--ok-ink)] bg-[var(--ok-ink)] px-5 py-3 font-semibold text-[var(--ok-paper)] transition-colors hover:bg-[var(--ok-accent-text)] hover:text-[var(--ok-ink)]"
              >
                {copy.contactLabel}
              </a>
              <span dir="ltr" className="text-sm text-[var(--ok-ink)]/65">
                {LEGAL_IDENTITY.email}
              </span>
            </div>
          </article>
        </main>

        <SiteFooter lang={lang} />
      </div>
    </ThemeProvider>
  );
}
