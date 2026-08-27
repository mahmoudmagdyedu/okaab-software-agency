import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Mail } from "lucide-react";
import { WhatsAppIcon } from "@/components/okaab/WhatsAppIcon";
import { ThemeProvider } from "@/lib/theme";
import {
  OkaabStyles,
  SiteHeader,
  SiteFooter,
  rememberLocale,
  ACCENT,
  ACCENT_HOVER,
  WHATSAPP,
  EMAIL_SALES,
  type ChromeLang,
} from "@/components/okaab/SiteChrome";

export const SITE = "https://okaab.org";

export type ServicePageContent = {
  lang: ChromeLang;
  htmlLang: string;
  dir: "rtl" | "ltr";
  /** Path of this localized page, e.g. "/en/ecommerce-development-egypt" */
  path: string;
  /** Every localized variant of this page: htmlLang -> path */
  alternates: Record<string, string>;
  title: string;
  description: string;
  breadcrumbHome: string;
  breadcrumbLabel: string;
  navAriaLabel: string;
  hero: {
    kicker: string;
    h1: string;
    h1Italic: string;
    intro: string;
    ctaQuote: string;
    ctaWhatsapp: string;
  };
  features: { kicker: string; title: string; items: { title: string; body: string }[] };
  steps: { kicker: string; title: string; items: { n: string; title: string; body: string }[] };
  faq: { kicker: string; title: string; items: { q: string; a: string }[] };
  closing: { title: string; body: string };
  schema: { serviceName: string; serviceType: string };
};

export function buildServiceHead(c: ServicePageContent) {
  const url = `${SITE}${c.path}`;
  return {
    meta: [
      { title: c.title },
      { name: "description", content: c.description },
      { property: "og:title", content: c.title },
      { property: "og:description", content: c.description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url },
      { property: "og:locale", content: c.htmlLang.replace("-", "_") },
      { property: "og:image", content: `${SITE}/og-image.jpg` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: `${SITE}/og-image.jpg` },
    ],
    links: [
      { rel: "canonical", href: url },
      ...Object.entries(c.alternates).map(([lang, path]) => ({
        rel: "alternate",
        hrefLang: lang,
        href: `${SITE}${path}`,
      })),
      { rel: "alternate", hrefLang: "x-default", href: `${SITE}${c.alternates["ar"] ?? c.path}` },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          name: c.schema.serviceName,
          serviceType: c.schema.serviceType,
          url,
          inLanguage: c.htmlLang,
          areaServed: { "@type": "Country", name: "Egypt" },
          provider: {
            "@type": "Organization",
            name: "عُقاب OKAAB",
            url: `${SITE}/`,
            email: EMAIL_SALES,
            telephone: WHATSAPP,
          },
          description: c.description,
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          inLanguage: c.htmlLang,
          mainEntity: c.faq.items.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: c.breadcrumbHome, item: `${SITE}/` },
            { "@type": "ListItem", position: 2, name: c.breadcrumbLabel, item: url },
          ],
        }),
      },
    ],
  };
}

export function ServiceLanding({ content: c }: { content: ServicePageContent }) {
  const Arrow = c.dir === "rtl" ? ArrowLeft : ArrowRight;
  const arrowHover = c.dir === "rtl" ? "group-hover:-translate-x-1" : "group-hover:translate-x-1";

  // Respect the language chosen elsewhere on the site; otherwise remember this one.
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem("okaab.locale");
    } catch {
      saved = null;
    }
    const target = saved ? (saved.startsWith("ar") ? "ar" : saved) : null;
    const href = target ? c.alternates[target] : undefined;
    if (href && href !== c.path) {
      window.location.replace(href);
      return;
    }
    rememberLocale(c.lang);
  }, [c.alternates, c.path, c.lang]);

  useEffect(() => {
    const el = document.documentElement;
    const prevLang = el.getAttribute("lang");
    const prevDir = el.getAttribute("dir");
    el.setAttribute("lang", c.htmlLang);
    el.setAttribute("dir", c.dir);
    return () => {
      if (prevLang) el.setAttribute("lang", prevLang);
      if (prevDir) el.setAttribute("dir", prevDir);
    };
  }, [c.htmlLang, c.dir]);

  return (
    <ThemeProvider>
      <div
        dir={c.dir}
        lang={c.htmlLang}
        className="min-h-screen bg-[var(--ok-paper)] text-[var(--ok-ink)] antialiased overflow-x-hidden"
        style={{
          fontFamily: "'Space Grotesk', 'IBM Plex Sans Arabic', sans-serif",
          lineHeight: 1.7,
        }}
      >
        <OkaabStyles />
        <SiteHeader lang={c.lang} alternates={c.alternates} path={c.path} />

        <main id="main">
          {/* ───── HERO ───── */}
          <header className="relative paper-grain" style={{ backgroundColor: "var(--ok-paper)" }}>
            <div className="relative ok-container pt-12 pb-16 sm:pt-16 sm:pb-20 md:pt-20 md:pb-24 lg:pt-24 lg:pb-28">
              <nav aria-label={c.navAriaLabel} className="mb-6 text-sm text-[var(--ok-ink)]/70">
                <Link to="/" className="accent-link underline underline-offset-4">
                  {c.breadcrumbHome}
                </Link>
                <span className="mx-2 opacity-50">/</span>
                <span>{c.breadcrumbLabel}</span>
              </nav>

              <p
                className="ok-in font-hand text-xl sm:text-2xl md:text-3xl -rotate-2 inline-block mb-4"
                style={{ color: "#2B5BE3" }}
              >
                {c.hero.kicker}
              </p>
              <h1 className="ok-in font-display font-black leading-[0.95] tracking-tight text-[2.25rem] sm:text-[3rem] md:text-[3.75rem] lg:text-[4.5rem] max-w-4xl">
                {c.hero.h1}{" "}
                <span className="italic font-medium squiggle-underline inline-block">
                  {c.hero.h1Italic}
                </span>
              </h1>
              <p className="ok-in mt-7 max-w-2xl text-base sm:text-lg leading-relaxed text-[var(--ok-ink)]/75">
                {c.hero.intro}
              </p>

              <div className="ok-in mt-8 flex flex-wrap items-center gap-4">
                <Link
                  to="/"
                  hash="quote"
                  className="group border-2 border-[var(--ok-ink)] text-[#181511] font-semibold px-5 py-3 sm:px-7 sm:py-4 rounded-full text-base sm:text-lg flex items-center gap-2 shadow-[4px_4px_0_var(--ok-ink)] hover:shadow-[1px_1px_0_var(--ok-ink)] hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
                  style={{ backgroundColor: ACCENT }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = ACCENT_HOVER)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = ACCENT)}
                >
                  {c.hero.ctaQuote}
                  <Arrow size={20} className={`${arrowHover} transition-transform`} />
                </Link>
                <a
                  href={`https://wa.me/${WHATSAPP.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex items-center gap-3 bg-[#0A6B3F] text-[#FFF8ED] border-2 border-[var(--ok-ink)] font-semibold px-5 py-3 sm:px-7 sm:py-4 rounded-full text-base sm:text-lg shadow-[4px_4px_0_var(--ok-ink)] hover:shadow-[1px_1px_0_var(--ok-ink)] hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
                >
                  <WhatsAppIcon className="size-5 transition-transform group-hover:rotate-12" />
                  {c.hero.ctaWhatsapp}
                </a>
              </div>
            </div>
          </header>

          {/* ───── FEATURES ───── */}
          <section
            id="features"
            className="bg-[var(--ok-paper-2)] border-y-2 border-[var(--ok-ink)]"
            aria-labelledby="features-heading"
          >
            <div className="ok-container py-16 sm:py-20 md:py-24 lg:py-28">
              <p
                className="font-hand text-xl sm:text-2xl lg:text-3xl -rotate-1 mb-2"
                style={{ color: ACCENT }}
              >
                {c.features.kicker}
              </p>
              <h2
                id="features-heading"
                className="font-display font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight"
              >
                {c.features.title}
              </h2>
              <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {c.features.items.map((f) => (
                  <article
                    key={f.title}
                    className="bg-[var(--ok-card)] border-2 border-[var(--ok-ink)] rounded-2xl p-6 sm:p-7 shadow-[5px_5px_0_var(--ok-ink)] hover:shadow-[2px_2px_0_var(--ok-ink)] hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
                  >
                    <h3 className="font-display font-bold text-xl sm:text-2xl tracking-tight">
                      {f.title}
                    </h3>
                    <p className="mt-3 text-sm sm:text-base leading-relaxed text-[var(--ok-ink)]/75">
                      {f.body}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* ───── STEPS ───── */}
          <section className="ok-container py-16 sm:py-20 md:py-24" aria-labelledby="steps-heading">
            <p
              className="font-hand text-xl sm:text-2xl lg:text-3xl -rotate-1 mb-2"
              style={{ color: "#2B5BE3" }}
            >
              {c.steps.kicker}
            </p>
            <h2
              id="steps-heading"
              className="font-display font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight mb-8 sm:mb-10"
            >
              {c.steps.title}
            </h2>
            <ol className="border-t-2 border-[var(--ok-ink)]">
              {c.steps.items.map((s) => (
                <li
                  key={s.n}
                  className="job-row flex items-start gap-4 md:gap-6 py-6 sm:py-7 border-b-2 border-[var(--ok-ink)] hover:bg-[var(--ok-paper-2)]"
                >
                  <span className="shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 border-[var(--ok-ink)] flex items-center justify-center font-display font-bold">
                    <span dir="ltr">{s.n}</span>
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-display font-bold text-lg sm:text-xl md:text-2xl tracking-tight">
                      {s.title}
                    </h3>
                    <p className="mt-2 text-sm sm:text-base leading-relaxed text-[var(--ok-ink)]/75 max-w-2xl">
                      {s.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* ───── FAQ ───── */}
          <section
            id="faq"
            className="bg-[var(--ok-paper-2)] border-y-2 border-[var(--ok-ink)]"
            aria-labelledby="faq-heading"
          >
            <div className="ok-container py-16 sm:py-20 md:py-24">
              <p
                className="font-hand text-xl sm:text-2xl lg:text-3xl -rotate-1 mb-2"
                style={{ color: ACCENT }}
              >
                {c.faq.kicker}
              </p>
              <h2
                id="faq-heading"
                className="font-display font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight mb-8 sm:mb-10"
              >
                {c.faq.title}
              </h2>
              <div className="border-t-2 border-[var(--ok-ink)]">
                {c.faq.items.map((f) => (
                  <details
                    key={f.q}
                    className="group border-b-2 border-[var(--ok-ink)] py-5 sm:py-6"
                  >
                    <summary className="cursor-pointer list-none flex items-start justify-between gap-4">
                      <h3 className="font-display font-bold text-lg sm:text-xl md:text-2xl tracking-tight">
                        {f.q}
                      </h3>
                      <span className="shrink-0 w-8 h-8 rounded-full border-2 border-[var(--ok-ink)] flex items-center justify-center group-open:rotate-45 transition-transform">
                        +
                      </span>
                    </summary>
                    <p className="mt-3 max-w-3xl text-sm sm:text-base leading-relaxed text-[var(--ok-ink)]/75">
                      {f.a}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* ───── CLOSING CTA ───── */}
          <section className="ok-container py-16 sm:py-20 md:py-24 text-center">
            <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl tracking-tight">
              {c.closing.title}
            </h2>
            <p className="mt-4 mx-auto max-w-2xl text-sm sm:text-base leading-relaxed text-[var(--ok-ink)]/75">
              {c.closing.body}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                to="/"
                hash="quote"
                className="group border-2 border-[var(--ok-ink)] text-[#181511] font-semibold px-6 py-4 rounded-full text-base sm:text-lg flex items-center gap-2 shadow-[5px_5px_0_var(--ok-ink)] hover:shadow-[1px_1px_0_var(--ok-ink)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
                style={{ backgroundColor: ACCENT }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = ACCENT_HOVER)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = ACCENT)}
              >
                {c.hero.ctaQuote}
                <Arrow size={20} className={`${arrowHover} transition-transform`} />
              </Link>
              <a
                href={`mailto:${EMAIL_SALES}`}
                dir="ltr"
                className="inline-flex items-center gap-2 border-2 border-[var(--ok-ink)] bg-[var(--ok-paper-2)] font-semibold px-6 py-4 rounded-full text-base sm:text-lg shadow-[5px_5px_0_var(--ok-ink)] hover:shadow-[1px_1px_0_var(--ok-ink)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
              >
                <Mail size={20} />
                {EMAIL_SALES}
              </a>
            </div>
          </section>
        </main>

        <SiteFooter lang={c.lang} />
      </div>
    </ThemeProvider>
  );
}
