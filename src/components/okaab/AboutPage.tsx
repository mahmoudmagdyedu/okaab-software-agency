import { ArrowUpRight, Check } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { OkaabStyles, SiteFooter, SiteHeader } from "@/components/okaab/SiteChrome";
import type { AboutCopy, LegalLanguage } from "@/content/legal";
import { ThemeProvider } from "@/lib/theme";
import { useDocumentLanguage } from "@/lib/use-document-language";

export function AboutPage({ lang, copy }: { lang: LegalLanguage; copy: AboutCopy }) {
  const rtl = lang === "ar";
  useDocumentLanguage(lang);
  return (
    <ThemeProvider>
      <div
        dir={rtl ? "rtl" : "ltr"}
        lang={lang}
        className="min-h-screen bg-[var(--ok-paper)] text-[var(--ok-ink)]"
      >
        <OkaabStyles />
        <SiteHeader lang={lang} />
        <main>
          <section className="ok-container py-14 sm:py-20 lg:py-28">
            <div className="max-w-5xl">
              <div className="mb-5 inline-flex -rotate-1 rounded-full border-2 border-[var(--ok-ink)] bg-[#E8A33D] px-4 py-2 text-sm font-bold text-[#181511]">
                {copy.eyebrow}
              </div>
              <h1 className="font-display max-w-5xl text-4xl font-black leading-tight sm:text-6xl lg:text-7xl">
                {copy.title}
              </h1>
              <p className="mt-7 max-w-4xl text-lg leading-9 text-[var(--ok-ink)]/75 sm:text-xl">
                {copy.intro}
              </p>
              <a
                href={lang === "ar" ? "/en/about" : "/about"}
                hrefLang={lang === "ar" ? "en" : "ar"}
                className="mt-5 inline-flex font-semibold text-[var(--ok-accent-text)] underline underline-offset-4"
              >
                {lang === "ar" ? "Read in English" : "اقرأ بالعربية"}
              </a>
            </div>
          </section>

          <section className="border-y-2 border-[var(--ok-ink)] bg-[var(--ok-paper-2)]">
            <div className="ok-container py-14 sm:py-20">
              <h2 className="font-display text-3xl font-bold sm:text-4xl">{copy.valuesTitle}</h2>
              <div className="mt-8 grid gap-5 md:grid-cols-3">
                {copy.values.map((value, index) => (
                  <article
                    key={value.title}
                    className="rounded-3xl border-2 border-[var(--ok-ink)] bg-[var(--ok-paper)] p-6 shadow-[5px_5px_0_var(--ok-ink)]"
                  >
                    <span className="font-display text-4xl font-black text-[var(--ok-accent-text)]">
                      0{index + 1}
                    </span>
                    <h3 className="mt-5 font-display text-2xl font-bold">{value.title}</h3>
                    <p className="mt-3 leading-7 text-[var(--ok-ink)]/70">{value.body}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="ok-container grid gap-12 py-16 lg:grid-cols-[1.1fr_.9fr] lg:py-24">
            <div>
              <h2 className="font-display text-3xl font-bold sm:text-4xl">{copy.storyTitle}</h2>
              <div className="mt-6 space-y-5 text-base leading-8 text-[var(--ok-ink)]/75 sm:text-lg">
                {copy.story.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              <h2 className="mt-12 font-display text-3xl font-bold sm:text-4xl">
                {copy.audienceTitle}
              </h2>
              <p className="mt-5 text-base leading-8 text-[var(--ok-ink)]/75 sm:text-lg">
                {copy.audience}
              </p>
            </div>
            <aside className="rounded-[2rem] border-2 border-[var(--ok-ink)] bg-[#E8A33D] p-7 text-[#181511] shadow-[7px_7px_0_var(--ok-ink)] sm:p-9">
              <h2 className="font-display text-3xl font-black">{copy.servicesTitle}</h2>
              <ul className="mt-7 space-y-4">
                {copy.services.map((service) => (
                  <li key={service} className="flex items-start gap-3 font-semibold leading-7">
                    <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-[#181511] text-[#E8A33D]">
                      <Check size={15} />
                    </span>
                    <span>{service}</span>
                  </li>
                ))}
              </ul>
            </aside>
          </section>

          <section className="border-t-2 border-[var(--ok-ink)] bg-[var(--ok-ink)] text-[var(--ok-paper)]">
            <div className="ok-container py-14 text-center sm:py-20">
              <h2 className="font-display text-3xl font-black sm:text-5xl">{copy.ctaTitle}</h2>
              <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[var(--ok-paper)]/75">
                {copy.ctaBody}
              </p>
              <Link
                to="/"
                hash="quote"
                className="mt-8 inline-flex items-center gap-2 rounded-full border-2 border-[var(--ok-paper)] bg-[#E8A33D] px-6 py-4 font-bold text-[#181511]"
              >
                {copy.ctaLabel} <ArrowUpRight size={19} />
              </Link>
            </div>
          </section>
        </main>
        <SiteFooter lang={lang} />
      </div>
    </ThemeProvider>
  );
}
