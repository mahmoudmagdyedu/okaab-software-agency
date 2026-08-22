import { useEffect, useRef, useState, type CSSProperties } from "react";

import {
  ArrowUpRight,
  ArrowRight,
  Layers,
  Globe,
  Smartphone,
  LifeBuoy,
  Server,
  Search,
  Tag,
  Send,
  MessageCircle,
  Languages,
  Sun,
  Moon,
  Menu,
  X,
} from "lucide-react";
import { useI18n, LOCALE_LABELS, LOCALE_ORDER } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { submitQuoteRequest } from "@/lib/quote.functions";

const LOCALE_SHORT: Record<string, string> = {
  "ar-EG": "مصري",
  ar: "خليجي",
  en: "EN",
  fr: "FR",
  es: "ES",
};
const ACCENT = "#E8A33D";
const ACCENT_HOVER = "#F2B95C";

const ROW_META = [
  { dept: 1, color: ACCENT },
  { dept: 1, color: ACCENT },
  { dept: 1, color: "#2B5BE3" },
  { dept: 2, color: "#2B5BE3" },
  { dept: 2, color: "#2B5BE3" },
  { dept: 3, color: "#0D9B5C" },
  { dept: 3, color: "#0D9B5C" },
  { dept: 4, color: "#B048D6" },
];

const SERVICE_META = [
  { icon: Globe, bg: "#FFD43B", rotate: "-2deg" },
  { icon: Smartphone, bg: ACCENT, rotate: "1.5deg" },
  { icon: LifeBuoy, bg: "#C7E8FF", rotate: "-1deg" },
  { icon: Server, bg: "#0D9B5C", rotate: "2deg", light: true },
  { icon: Search, bg: "#B048D6", rotate: "-1.5deg", light: true },
  { icon: Tag, bg: "#FFF3E0", rotate: "1deg" },
];

const CARD_META = [
  { rotate: -3, mt: 0 },
  { rotate: 2, mt: 24 },
  { rotate: -1.5, mt: 8 },
];

const WHATSAPP = "+201555317977";
const EMAIL = "hello@okaab.org";
const EMAIL_SALES = "sales@okaab.org";
const EMAIL_SUPPORT = "support@okaab.org";
const MAWID_URL = "https://okaab-mawid-ef3bbc493d4a.herokuapp.com/book/smile";

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
}

export default function OkaabLanding() {
  const { t, locale, setLocale } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const [dept, setDept] = useState(0);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const rtl = t.dir === "rtl";

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  // Reveal-on-scroll (replaces framer-motion whileInView, ~110 KB lighter)
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>(".reveal"));
    if (typeof IntersectionObserver === "undefined") {
      els.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "-60px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [locale]);

  // Pause the stats ticker when off-screen or the tab is hidden (saves CPU/battery)
  const marqueeRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = marqueeRef.current;
    if (!el) return;
    let visible = true;
    const apply = () => {
      el.style.setProperty(
        "--marquee-state",
        visible && !document.hidden ? "running" : "paused",
      );
    };
    const onVis = () => apply();
    document.addEventListener("visibilitychange", onVis);
    let io: IntersectionObserver | undefined;
    if (typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(
        ([entry]) => {
          visible = !!entry?.isIntersecting;
          apply();
        },
        { threshold: 0 },
      );
      io.observe(el);
    }
    apply();
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      io?.disconnect();
    };
  }, []);


  const rows = t.catalog.rows
    .map((r, i) => ({ ...r, ...ROW_META[i]!, id: i }))
    .filter((r) => dept === 0 || r.dept === dept);


  return (
    <div
      ref={rootRef}
      dir={t.dir}

      className="min-h-screen bg-[var(--ok-paper)] text-[var(--ok-ink)] antialiased overflow-x-hidden"
      style={{
        fontFamily: "'Space Grotesk', 'IBM Plex Sans Arabic', sans-serif",
        lineHeight: rtl ? 1.7 : undefined,
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        ::selection { background: ${ACCENT}; color: var(--ok-paper-2); }
        .font-display { font-family: 'Fraunces', 'IBM Plex Sans Arabic', serif; font-variation-settings: 'opsz' 144; }
        .font-hand { font-family: 'Caveat', 'IBM Plex Sans Arabic', cursive; }
        [dir="rtl"] .font-hand { font-family: 'IBM Plex Sans Arabic', sans-serif; font-weight: 600; }
        @keyframes marquee { from { transform: translate3d(0,0,0); } to { transform: translate3d(-50%,0,0); } }
        .marquee-wrap { overflow: hidden; contain: content; }
        .marquee-track { display: flex; width: max-content; animation: marquee var(--marquee-duration, 40s) linear infinite; animation-play-state: var(--marquee-state, running); will-change: transform; backface-visibility: hidden; transform: translate3d(0,0,0); }
        .marquee-group { display: flex; flex: 0 0 auto; min-width: 100vw; justify-content: space-around; }
        .marquee-wrap:hover .marquee-track { --marquee-duration: 90s; }
        @keyframes okIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
        @keyframes okPop { from { opacity: 0; transform: scale(0.6); } to { opacity: 1; transform: scale(1); } }
        @keyframes okFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        .ok-in { animation: okIn 0.6s cubic-bezier(.2,.8,.2,1) both; }
        .ok-pop { animation: okPop 0.6s cubic-bezier(.2,1.2,.3,1) both; }
        .ok-fade-in { animation: okFadeIn 0.25s ease both; }
        .reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.5s ease, transform 0.5s cubic-bezier(.2,.8,.2,1); }
        .reveal[data-reveal="x"] { transform: translateX(24px); }
        [dir="rtl"] .reveal[data-reveal="x"] { transform: translateX(-24px); }
        .reveal.is-in { opacity: 1; transform: none; }
        .svc-card { transition: rotate 0.35s cubic-bezier(.2,.8,.2,1), scale 0.35s cubic-bezier(.2,.8,.2,1), opacity 0.5s ease; }
        .svc-card:hover { rotate: 0deg !important; scale: 1.02; }
        .svc-card.reveal { opacity: 0; transform: translateY(24px); }
        .svc-card.reveal.is-in { opacity: 1; transform: none; }
        @media (prefers-reduced-motion: reduce) {
          .marquee-track, .spin-slow, .ok-in, .ok-pop, .ok-fade-in { animation: none !important; }
          .reveal { opacity: 1 !important; transform: none !important; transition: none !important; }
        }



        @keyframes spin-slow { to { transform: rotate(360deg); } }
        .spin-slow { animation: spin-slow 18s linear infinite; }
        .paper-grain { background-image: radial-gradient(var(--ok-ink) 0.6px, transparent 0.6px); background-size: 22px 22px; }
        .job-row { transition: background 0.25s ease, padding-inline-start 0.25s ease; }
        .job-row:hover { padding-inline-start: 1.5rem; }
        .squiggle-underline {
          background: url("data:image/svg+xml,%3Csvg width='60' height='8' viewBox='0 0 60 8' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 4 Q 7.5 0, 15 4 T 30 4 T 45 4 T 60 4' stroke='%23E8A33D' stroke-width='3' fill='none'/%3E%3C/svg%3E") repeat-x bottom;
          background-size: 60px 8px;
          padding-bottom: 12px;
        }
        .photo-card { transition: transform 0.35s cubic-bezier(.2,.8,.2,1); }
        .photo-card:hover { transform: rotate(0deg) scale(1.04) !important; z-index: 10; }
        .accent-link:hover { color: ${ACCENT}; }
        .tilt-card { transform: none; margin-top: 0; }
        @media (min-width: 1024px) {
          .tilt-card { transform: rotate(var(--rot)); margin-top: var(--mt); }
        }
      `,
        }}
      />

      {/* ───── NAV ───── */}
      <nav className="sticky top-0 z-50 bg-[var(--ok-paper)]/90 backdrop-blur-md border-b-2 border-[var(--ok-ink)]">
        <div className="ok-container h-16 lg:h-18 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <img
              src="/logo-96.webp"
              srcSet="/logo-96.webp 1x, /logo-192.webp 2x"
              alt="شعار عُقاب OKAAB"
              width={32}
              height={32}
              decoding="async"
              fetchPriority="high"
              className="w-8 h-8 shrink-0 object-contain"
            />

            <span className="font-display font-bold text-lg sm:text-xl tracking-tight truncate">عُقاب</span>
            <span
              dir="ltr"
              className="font-hand text-base sm:text-lg -rotate-6 ms-1 mt-1 tracking-wide shrink-0 whitespace-nowrap lg:hidden xl:inline"
              style={{ color: "var(--ok-accent-text)" }}
            >
              OKAAB
            </span>
          </div>
          <div className="hidden lg:flex items-center gap-4 xl:gap-7 text-[13px] xl:text-sm font-medium">
            <a href="#catalog" className="accent-link transition-colors whitespace-nowrap">
              {t.nav.services}
            </a>
            <a href="#projects" className="accent-link transition-colors whitespace-nowrap">
              {t.nav.projects}
            </a>
            <a href="#services" className="accent-link transition-colors whitespace-nowrap">
              {t.nav.why}
            </a>
            <a href="#about" className="accent-link transition-colors whitespace-nowrap">
              {t.nav.process}
            </a>
            <button
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Light mode" : "Dark mode"}
              className="accent-link transition-colors opacity-70 hover:opacity-100"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <div dir="ltr" className="flex items-center gap-1.5 whitespace-nowrap">
              <Languages size={15} className="opacity-60 shrink-0" />
              {LOCALE_ORDER.map((code) => (
                <button
                  key={code}
                  onClick={() => setLocale(code)}
                  aria-label={LOCALE_LABELS[code]}
                  aria-current={locale === code ? "true" : undefined}
                  className={`rounded-full border-2 border-[var(--ok-ink)] px-2.5 py-1 text-xs font-semibold transition-colors ${
                    locale === code
                      ? "bg-[var(--ok-ink)] text-[var(--ok-paper)]"
                      : "bg-transparent text-[var(--ok-ink)]/80 hover:text-[var(--ok-ink)]"
                  }`}
                >
                  {LOCALE_SHORT[code]}
                </button>
              ))}
            </div>

            <a
              href="#quote"
              className="bg-[var(--ok-ink)] text-[var(--ok-paper)] px-3 xl:px-4 py-2 rounded-full whitespace-nowrap flex items-center gap-1.5 transition-colors border-2 border-[var(--ok-ink)] hover:text-[var(--ok-ink)]"
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = ACCENT)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
            >
              {t.nav.cta} <ArrowUpRight size={15} />
            </a>
          </div>

          {/* mobile burger */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="lg:hidden w-10 h-10 rounded-full border-2 border-[var(--ok-ink)] flex items-center justify-center shrink-0"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* mobile panel */}
        {menuOpen && (
          <div
            id="mobile-menu"
            className="lg:hidden border-t-2 border-[var(--ok-ink)] bg-[var(--ok-paper)] px-4 sm:px-6 py-4 flex flex-col gap-3 text-base font-medium"
          >
            <a href="#catalog" onClick={() => setMenuOpen(false)} className="accent-link transition-colors py-1">
              {t.nav.services}
            </a>
            <a href="#projects" onClick={() => setMenuOpen(false)} className="accent-link transition-colors py-1">
              {t.nav.projects}
            </a>
            <a href="#services" onClick={() => setMenuOpen(false)} className="accent-link transition-colors py-1">
              {t.nav.why}
            </a>
            <a href="#about" onClick={() => setMenuOpen(false)} className="accent-link transition-colors py-1">
              {t.nav.process}
            </a>
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 pt-3 mt-1 border-t border-[var(--ok-ink)]/20">
              <div dir="ltr" className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-2 text-sm">
                <Languages size={15} className="opacity-60 shrink-0" />
                {LOCALE_ORDER.map((code) => (
                  <button
                    key={code}
                    onClick={() => setLocale(code)}
                    aria-label={LOCALE_LABELS[code]}
                    aria-current={locale === code ? "true" : undefined}
                    className={`rounded-full border-2 border-[var(--ok-ink)] px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition-colors ${
                      locale === code
                        ? "bg-[var(--ok-ink)] text-[var(--ok-paper)]"
                        : "bg-transparent text-[var(--ok-ink)]/80"
                    }`}
                  >
                    {LOCALE_SHORT[code]}
                  </button>
                ))}
              </div>
              <button
                onClick={toggleTheme}
                aria-label={theme === "dark" ? "Light mode" : "Dark mode"}
                className="w-9 h-9 rounded-full border-2 border-[var(--ok-ink)] flex items-center justify-center shrink-0"
              >
                {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            </div>
            <a
              href="#quote"
              onClick={() => setMenuOpen(false)}
              className="mt-1 bg-[var(--ok-ink)] text-[var(--ok-paper)] px-4 py-3 rounded-full flex items-center justify-center gap-1.5 border-2 border-[var(--ok-ink)]"
            >
              {t.nav.cta} <ArrowUpRight size={16} />
            </a>
          </div>
        )}
      </nav>

      <main id="main">
      {/* ───── HERO ───── */}
      <header className="relative paper-grain" style={{ backgroundColor: "var(--ok-paper)" }}>
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(circle at 70% 20%, transparent, var(--ok-paper) 70%)" }}
        />
        <div className="relative ok-container pt-16 pb-20 sm:pt-20 sm:pb-24 md:pt-28 md:pb-32 lg:pt-30 lg:pb-36 xl:pt-32 xl:pb-40 2xl:pt-40 2xl:pb-48">
          <p
            className="ok-in font-hand text-xl sm:text-2xl md:text-3xl xl:text-4xl text-[#2B5BE3] -rotate-2 inline-block mb-4 sm:mb-6"
          >
            {t.hero.kicker}
          </p>

          <h1
            className="ok-in font-display font-black leading-[0.92] tracking-tight text-[2.25rem] sm:text-[3rem] md:text-[4rem] lg:text-[5rem] xl:text-[5.75rem] 2xl:text-[6.75rem]"
            style={{ lineHeight: rtl ? 1.15 : undefined, animationDelay: "0.1s" }}
          >
            {t.hero.h1a}
            <br />
            {t.hero.h1b}
            <br />
            <span className="italic font-medium squiggle-underline inline-block mb-3 md:mb-0">
              {t.hero.h1italic}
            </span>
          </h1>

          <div
            className="ok-in mt-8 sm:mt-10 xl:mt-12 flex flex-col md:flex-row md:items-end gap-6 sm:gap-8 md:gap-12 lg:gap-16 2xl:gap-20"
            style={{ animationDelay: "0.25s" }}
          >
            <p className="max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl text-base sm:text-lg xl:text-xl 2xl:text-[1.375rem] leading-relaxed text-[var(--ok-ink)]/75">{t.hero.sub}</p>

            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#quote"
                className="group border-2 border-[var(--ok-ink)] text-[#181511] font-semibold px-5 py-3 sm:px-7 sm:py-4 xl:px-8 xl:py-5 rounded-full text-base sm:text-lg xl:text-xl flex items-center gap-2 shadow-[4px_4px_0_var(--ok-ink)] hover:shadow-[1px_1px_0_var(--ok-ink)] hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
                style={{ backgroundColor: ACCENT }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = ACCENT_HOVER)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = ACCENT)}
              >
                {t.hero.primary}
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform rtl:rotate-180" />
              </a>
              <a
                href="#catalog"
                className="font-semibold text-base sm:text-lg xl:text-xl underline underline-offset-8 decoration-2 accent-link transition-colors"
              >
                {t.hero.secondary}
              </a>
            </div>
          </div>

          {/* spinning badge */}
          <div
            className="ok-pop hidden lg:flex absolute top-20 xl:top-24 2xl:top-28 w-32 h-32 xl:w-44 xl:h-44 2xl:w-52 2xl:h-52 items-center justify-center"
            style={{ insetInlineEnd: "1rem", animationDelay: "0.4s" }}
          >
            <div className="absolute inset-0 spin-slow">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <defs>
                  <path id="circ" d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
                </defs>
                <text fontSize="9.5" fontWeight="700" letterSpacing="2.5" fill="var(--ok-ink)">
                  <textPath href="#circ">{t.hero.badgeRing}</textPath>
                </text>
              </svg>
            </div>
            <div className="w-14 h-14 xl:w-20 xl:h-20 2xl:w-24 2xl:h-24 bg-[#FFD43B] border-2 border-[var(--ok-ink)] rounded-full flex items-center justify-center -rotate-12">
              <span className="font-display font-black text-base xl:text-xl 2xl:text-2xl text-[#181511]">{t.hero.badgeNum}</span>

            </div>
          </div>

        </div>
      </header>

      {/* ───── STATS MARQUEE ───── */}
      <div ref={marqueeRef} dir="ltr" className="marquee-wrap bg-[var(--ok-ink)] text-[var(--ok-paper)] py-3 sm:py-3.5 lg:py-4 2xl:py-5 border-y-2 border-[var(--ok-ink)]">
        <div className="marquee-track whitespace-nowrap">

          {[0, 1].map((g) => (
            <div key={g} className="marquee-group" aria-hidden={g === 1 ? true : undefined}>
              {t.stats.map((item, i) => (
                <span
                  key={`${g}-${i}`}
                  dir="auto"
                  className="flex items-center text-xs sm:text-sm lg:text-base font-medium tracking-wide uppercase"
                >

                  <span className="px-4 sm:px-5 lg:px-6">{item}</span>
                  <span style={{ color: ACCENT }}>✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>


      {/* ───── TESTIMONIALS ───── */}
      <section className="ok-container py-12 sm:py-16 md:py-20 lg:py-24 2xl:py-28">
        <p className="font-hand text-xl sm:text-2xl lg:text-3xl text-[#2B5BE3] -rotate-1 mb-6 sm:mb-8 lg:mb-10 text-center">{t.testimonialsKicker}</p>
        <div className="flex gap-4 md:gap-6 xl:gap-8 justify-center flex-wrap lg:flex-nowrap">

          {t.testimonials.map((tm, i) => (
            <div
              key={tm.name}
              className="photo-card tilt-card relative w-full sm:w-[calc(50%-0.75rem)] lg:w-1/3 lg:aspect-[3/4] border-2 border-[var(--ok-ink)] rounded-2xl overflow-hidden shadow-[5px_5px_0_var(--ok-ink)] bg-[var(--ok-card)] p-5 sm:p-6 md:p-7 xl:p-8 flex flex-col justify-between gap-4 sm:gap-5"
              style={
                {
                  "--rot": `${CARD_META[i]!.rotate}deg`,
                  "--mt": `${CARD_META[i]!.mt}px`,
                } as CSSProperties
              }
            >
              <div className="self-start font-hand text-lg bg-[var(--ok-paper)] border-2 border-[var(--ok-ink)] rounded-full px-3 py-0.5 leading-tight">
                {tm.tag}
              </div>
              <p className="font-display text-lg sm:text-xl md:text-2xl xl:text-[1.75rem] leading-snug tracking-tight">“{tm.quote}”</p>
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-full border-2 border-[var(--ok-ink)] flex items-center justify-center font-display font-bold shrink-0"
                  style={{ backgroundColor: [ACCENT, "#C7E8FF", "#FFD43B"][i] }}
                >
                  <span dir="ltr" className="text-[#181511]">{initials(tm.name)}</span>
                </div>
                <div className="min-w-0">
                  <div className="font-semibold leading-tight truncate">{tm.name}</div>
                  <div className="text-sm text-[var(--ok-ink)]/75 leading-tight truncate">{tm.role}</div>
                </div>
              </div>

            </div>
          ))}
        </div>
      </section>

      {/* ───── PROJECTS ───── */}
      <section
        id="projects"
        className="border-y-2 border-[var(--ok-ink)] bg-[#D25218] text-[#FFF8ED]"
      >
        <div className="ok-container py-16 sm:py-20 md:py-28 lg:py-32">
          <div className="mb-10 max-w-4xl sm:mb-12">
            <p className="mb-2 -rotate-1 font-hand text-xl text-[#FFD43B] sm:text-2xl lg:text-3xl">
              {t.projects.kicker}
            </p>
            <h2 className="font-display text-3xl font-black tracking-tight sm:text-4xl md:text-5xl lg:text-6xl 2xl:text-7xl">
              {t.projects.title}
            </h2>
          </div>

          <article className="grid overflow-hidden rounded-3xl border-2 border-[#181511] bg-[#FFF8ED] text-[#181511] shadow-[8px_8px_0_#181511] lg:grid-cols-[1.1fr_0.9fr]">
            <div className="flex flex-col justify-center p-6 sm:p-8 md:p-10 lg:p-12">
              <span className="mb-5 w-fit rounded-full border-2 border-[#181511] bg-[#FFD43B] px-3 py-1 text-xs font-bold uppercase tracking-wide">
                {t.projects.badge}
              </span>
              <h3 className="font-display text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                {t.projects.name}
              </h3>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#181511]/75 sm:text-base lg:text-lg">
                {t.projects.description}
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {t.projects.tags.map((tag) => (
                  <span key={tag} dir="auto" className="rounded-full border border-[#181511]/35 px-3 py-1 text-xs font-semibold">
                    {tag}
                  </span>
                ))}
              </div>
              <a
                href={MAWID_URL}
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-flex w-fit items-center gap-2 rounded-full border-2 border-[#181511] bg-[#181511] px-5 py-3 font-semibold text-[#FFF8ED] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#181511]"
              >
                {t.projects.cta}
                <ArrowUpRight size={18} className="rtl:-scale-x-100" />
              </a>
            </div>

            <div aria-hidden="true" className="min-h-[360px] border-t-2 border-[#181511] bg-[#F3EDE2] p-5 sm:p-8 lg:min-h-[520px] lg:border-s-2 lg:border-t-0">
              <div className="mx-auto h-full max-w-xl overflow-hidden rounded-2xl border-2 border-[#181511] bg-white shadow-[5px_5px_0_#181511]">
                <div className="flex h-11 items-center gap-2 border-b-2 border-[#181511] bg-[#181511] px-4">
                  <span className="size-2.5 rounded-full bg-[#D25218]" />
                  <span className="size-2.5 rounded-full bg-[#FFD43B]" />
                  <span className="size-2.5 rounded-full bg-[#65B87A]" />
                  <span className="ms-auto text-xs font-bold text-[#FFF8ED]">مَوعِد</span>
                </div>
                <div className="grid h-[calc(100%-44px)] grid-cols-[72px_1fr] sm:grid-cols-[108px_1fr]">
                  <div className="space-y-3 bg-[#27221D] p-3">
                    {Array.from({ length: 6 }, (_, index) => (
                      <span key={index} className={`block h-7 rounded ${index === 1 ? "bg-[#D25218]" : "bg-white/10"}`} />
                    ))}
                  </div>
                  <div className="p-4 sm:p-5">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <span className="h-7 w-28 rounded bg-[#27221D]" />
                      <span className="h-8 w-20 rounded-full bg-[#D25218]" />
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {["#FFF1E9", "#EDF4FF", "#F2F8E9"].map((color) => (
                        <span key={color} className="h-20 rounded-lg border border-[#181511]/20" style={{ backgroundColor: color }} />
                      ))}
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2 border-t border-[#181511]/20 pt-4">
                      {Array.from({ length: 12 }, (_, index) => (
                        <span key={index} className={`h-11 rounded border border-[#181511]/15 ${index === 2 || index === 7 ? "bg-[#D25218]/20" : "bg-[#F6F1E7]"}`} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* ───── SERVICE CATALOG ───── */}
      <section id="catalog" className="bg-[var(--ok-paper-2)] border-y-2 border-[var(--ok-ink)]">
        <div className="ok-container py-16 sm:py-20 md:py-28 lg:py-32 xl:py-34 2xl:py-36">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 sm:gap-6 mb-10 sm:mb-12 lg:mb-14">
            <div>
              <p className="font-hand text-xl sm:text-2xl lg:text-3xl mb-2 -rotate-1" style={{ color: ACCENT }}>
                {t.catalog.kicker}
              </p>
              <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl 2xl:text-7xl tracking-tight">{t.catalog.title}</h2>
              <p className="mt-4 max-w-2xl text-sm sm:text-base leading-relaxed text-[var(--ok-ink)]/75">{t.catalogIntro}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {t.catalog.depts.map((d, i) => (
                <button
                  key={d}
                  onClick={() => setDept(i)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border-2 border-[var(--ok-ink)] transition-all inline-flex items-center gap-1.5 ${
                    dept === i ? "bg-[var(--ok-ink)] text-[var(--ok-paper-2)]" : "bg-transparent hover:bg-[var(--ok-ink)]/5"
                  }`}
                  style={dept === i ? { boxShadow: `3px 3px 0 ${ACCENT}` } : undefined}
                >
                  <span>{d}</span>
                  {i !== 0 && (
                    <span className="opacity-60" dir="ltr">
                      {ROW_META.filter((r) => r.dept === i).length}
                    </span>
                  )}
                </button>

              ))}
            </div>
          </div>

          <div className="border-t-2 border-[var(--ok-ink)]">
            {rows.map((row) => (
              <a
                key={row.id}
                href="#quote"
                className="ok-fade-in job-row group flex items-center justify-between gap-4 py-5 sm:py-6 md:py-7 xl:py-8 border-b-2 border-[var(--ok-ink)] hover:bg-[var(--ok-paper)]"
              >
                <div className="flex items-center gap-4 md:gap-6 min-w-0">
                  <span
                    className="hidden md:inline-block w-3 h-3 rounded-full border-2 border-[var(--ok-ink)] shrink-0"
                    style={{ backgroundColor: row.color }}
                  />
                  <div className="min-w-0">
                    <h3 className="font-display font-bold text-lg sm:text-xl md:text-2xl lg:text-3xl 2xl:text-4xl tracking-tight accent-link transition-colors truncate">
                      {row.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-sm text-[var(--ok-ink)]/65 font-medium">
                      <span className="px-2 py-0.5 rounded-full border border-[var(--ok-ink)]/30 text-xs uppercase tracking-wider">
                        {t.catalog.depts[row.dept]}
                      </span>
                      <span className="flex items-center gap-1">
                        <Layers size={13} /> <span dir="ltr">{row.stack}</span>
                      </span>
                      <span>{row.time}</span>
                    </div>
                  </div>
                </div>
                <div className="shrink-0 w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 xl:w-16 xl:h-16 rounded-full border-2 border-[var(--ok-ink)] flex items-center justify-center group-hover:bg-[var(--ok-ink)] group-hover:text-[var(--ok-paper-2)] group-hover:rotate-45 transition-all duration-300">
                  <ArrowUpRight size={22} className="rtl:-scale-x-100" />
                </div>
              </a>
            ))}

          </div>

          <p className="mt-8 text-[var(--ok-ink)]/75 text-sm">{t.catalog.note}</p>
        </div>
      </section>

      {/* ───── SERVICES GRID ───── */}
      <section id="services" className="ok-container py-16 sm:py-20 md:py-28 lg:py-32 xl:py-36 2xl:py-40">
        <div className="text-center mb-10 sm:mb-12 md:mb-16 2xl:mb-20">
          <p className="font-hand text-xl sm:text-2xl lg:text-3xl text-[#2B5BE3] rotate-1 mb-2">{t.servicesSection.kicker}</p>
          <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl 2xl:text-7xl tracking-tight">
            {t.servicesSection.titleA} <span className="italic font-medium">{t.servicesSection.titleItalic}</span>
          </h2>
          <p className="mt-5 mx-auto max-w-3xl text-sm sm:text-base xl:text-lg leading-relaxed text-[var(--ok-ink)]/75 text-start sm:text-center">
            {t.servicesIntro}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 md:gap-8 2xl:gap-10">

          {t.services.map((service, i) => {
            const meta = SERVICE_META[i]!;
            const Icon = meta.icon;
            return (
              <div
                key={service.title}
                style={{ backgroundColor: meta.bg, rotate: meta.rotate, transitionDelay: `${(i % 3) * 0.08}s` }}
                className={`reveal svc-card border-2 border-[#181511] rounded-3xl p-6 sm:p-7 xl:p-8 shadow-[6px_6px_0_#181511] ${meta.light ? "text-[#FFF8ED]" : "text-[#181511]"}`}
              >
                <div
                  className={`w-11 h-11 sm:w-12 sm:h-12 xl:w-14 xl:h-14 rounded-full border-2 flex items-center justify-center mb-5 sm:mb-6 ${meta.light ? "border-[#FFF8ED]/80 bg-[#181511]/15" : "border-[#181511] bg-[#F6F1E7]"}`}
                >
                  <Icon size={22} strokeWidth={2.2} />
                </div>
                <h3 className="font-display font-bold text-xl sm:text-2xl xl:text-[1.75rem] mb-2 tracking-tight">{service.title}</h3>
                <p className={`text-sm sm:text-base leading-relaxed ${meta.light ? "text-[#FFF8ED]/85" : "text-[#181511]/75"}`}>

                  {service.copy}
                </p>
              </div>

            );
          })}
        </div>
        <div className="mt-8 text-center">
          <a
            href="/ecommerce-development-egypt"
            className="inline-flex items-center gap-2 font-semibold underline underline-offset-4 hover:opacity-70"
          >
            إنشاء متجر إلكتروني في مصر
            <ArrowUpRight size={18} />
          </a>
        </div>
      </section>


      {/* ───── ABOUT / PROCESS ───── */}
      <section id="about" className="bg-[var(--ok-ink)] text-[var(--ok-paper)] border-y-2 border-[var(--ok-ink)]">
        <div className="ok-container py-16 sm:py-20 md:py-28 lg:py-32 xl:py-36 2xl:py-40">
          <div className="grid md:grid-cols-12 gap-10 md:gap-12 xl:gap-16 2xl:gap-20">
            <div className="md:col-span-5 lg:col-span-4">
              <p className="font-hand text-xl sm:text-2xl lg:text-3xl text-[#FFD43B] -rotate-1 mb-2">{t.about.kicker}</p>
              <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl 2xl:text-6xl tracking-tight leading-[1.1] md:sticky md:top-28">

                {t.about.titleLines[0]}
                <br />
                {t.about.titleLines[1]}
                <br />
                {t.about.titleLines[2]}
                <span className="block mt-5 sm:mt-6 font-sans font-normal text-sm sm:text-base xl:text-lg leading-relaxed text-[var(--ok-paper)]/65 tracking-normal">
                  {t.about.paragraph}
                </span>
              </h2>
              <p className="mt-6 text-sm sm:text-base xl:text-lg leading-relaxed text-[var(--ok-paper)]/70">
                {t.aboutIntro}
              </p>
            </div>
            <div className="md:col-span-7 lg:col-span-8 space-y-0">
              {t.about.steps.map((v, i) => (
                <div
                  key={v.title}
                  data-reveal="x"
                  style={{ transitionDelay: `${i * 0.05}s` }}
                  className="reveal group flex gap-5 sm:gap-6 md:gap-10 py-7 sm:py-9 xl:py-10 border-b border-[var(--ok-paper)]/20 last:border-0"
                >
                  <span className="font-display font-black text-2xl sm:text-3xl xl:text-4xl mt-0.5" style={{ color: ACCENT }} dir="ltr">
                    {`0${i + 1}`}
                  </span>
                  <div>
                    <h3 className="font-display font-bold text-xl sm:text-2xl md:text-3xl 2xl:text-4xl tracking-tight mb-2 group-hover:text-[#FFD43B] transition-colors">

                      {v.title}
                    </h3>
                    <p className="text-sm sm:text-base xl:text-lg text-[var(--ok-paper)]/65 leading-relaxed max-w-xl 2xl:max-w-2xl">{v.copy}</p>
                  </div>
                </div>

              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───── QUOTE CTA ───── */}
      <section id="quote" className="ok-container py-16 sm:py-20 md:py-28 lg:py-32 xl:py-36 2xl:py-40 text-center relative">
        <div className="absolute left-1/2 -translate-x-1/2 top-8 sm:top-10 font-hand text-xl sm:text-2xl lg:text-3xl text-[var(--ok-success-text)] rotate-3">
          {t.quote.note}
        </div>
        <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl 2xl:text-7xl tracking-tight mt-10 sm:mt-12 mb-4 sm:mb-6">
          {t.quote.titleA} <span className="italic font-medium">{t.quote.titleItalic}</span>
        </h2>
        <p className="max-w-xl 2xl:max-w-2xl mx-auto text-base sm:text-lg xl:text-xl text-[var(--ok-ink)]/70 leading-relaxed mb-8 sm:mb-10">{t.quote.sub}</p>


        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const fd = new FormData(form);
            const get = (k: string) => String(fd.get(k) ?? "").trim();
            const payload = {
              name: get("name"),
              email: get("email"),
              phone: get("phone"),
              service: get("service"),
              details: get("details"),
              locale: t.code,
              pageUrl: typeof window !== "undefined" ? window.location.href : "",
            };
            const lines = [
              `${t.quote.fields.name}: ${payload.name}`,
              `${t.quote.fields.email}: ${payload.email}`,
              `${t.quote.fields.phone}: ${payload.phone}`,
              `${t.quote.servicePlaceholder}: ${payload.service}`,
              `${t.quote.fields.details}: ${payload.details}`,
            ].join("\n");
            const subject = `${t.quote.submit} — ${payload.name}`;
            setSending(true);
            setFailed(false);
            try {
              await submitQuoteRequest({ data: payload });
              setSent(true);
              form.reset();
            } catch {
              setFailed(true);
              window.open(
                `https://wa.me/${WHATSAPP.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(lines)}`,
                "_blank",
                "noopener,noreferrer",
              );
              window.location.href = `mailto:${EMAIL_SALES}?subject=${encodeURIComponent(
                subject,
              )}&body=${encodeURIComponent(lines)}`;
            } finally {
              setSending(false);
            }
          }}
          className="max-w-2xl xl:max-w-3xl mx-auto text-start grid grid-cols-1 sm:grid-cols-2 gap-4 xl:gap-5 mb-8"
        >
          <input
            required
            name="name"
            placeholder={t.quote.fields.name}
            aria-label={t.quote.fields.name}
            className="border-2 border-[var(--ok-ink)] rounded-2xl px-5 py-4 bg-[var(--ok-paper-2)] outline-none focus:shadow-[4px_4px_0_var(--ok-ink)] transition-all"
          />
          <input
            required
            type="email"
            name="email"
            dir="ltr"
            placeholder={t.quote.fields.email}
            aria-label={t.quote.fields.email}
            className="border-2 border-[var(--ok-ink)] rounded-2xl px-5 py-4 bg-[var(--ok-paper-2)] outline-none focus:shadow-[4px_4px_0_var(--ok-ink)] transition-all"
          />
          <input
            required
            type="tel"
            name="phone"
            dir="ltr"
            placeholder={t.quote.fields.phone}
            aria-label={t.quote.fields.phone}
            className="border-2 border-[var(--ok-ink)] rounded-2xl px-5 py-4 bg-[var(--ok-paper-2)] outline-none focus:shadow-[4px_4px_0_var(--ok-ink)] transition-all"
          />
          <select
            required
            name="service"
            defaultValue=""
            aria-label={t.quote.servicePlaceholder}
            className="border-2 border-[var(--ok-ink)] rounded-2xl px-5 py-4 bg-[var(--ok-paper-2)] outline-none focus:shadow-[4px_4px_0_var(--ok-ink)] transition-all"
          >
            <option value="" disabled>
              {t.quote.servicePlaceholder}
            </option>
            {t.quote.serviceOptions.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
          <textarea
            required
            rows={4}
            name="details"
            placeholder={t.quote.fields.details}
            aria-label={t.quote.fields.details}
            className="sm:col-span-2 border-2 border-[var(--ok-ink)] rounded-2xl px-5 py-4 bg-[var(--ok-paper-2)] outline-none focus:shadow-[4px_4px_0_var(--ok-ink)] transition-all resize-none"
          />

          <div className="sm:col-span-2 flex flex-wrap items-center justify-center gap-4 mt-2">
            <button
              type="submit"
              disabled={sending}
              className="group inline-flex items-center gap-3 text-[#181511] border-2 border-[var(--ok-ink)] font-semibold px-6 py-4 sm:px-8 sm:py-5 rounded-full text-base sm:text-lg shadow-[5px_5px_0_var(--ok-ink)] hover:shadow-[1px_1px_0_var(--ok-ink)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-x-0 disabled:translate-y-0"
              style={{ backgroundColor: ACCENT }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = ACCENT_HOVER)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = ACCENT)}
            >
              <Send
                size={20}
                className={sending ? "animate-pulse" : "group-hover:rotate-12 transition-transform"}
              />
              {sending ? t.quote.sending : t.quote.submit}
            </button>
            <a
              href={`https://wa.me/${WHATSAPP.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-3 bg-[#0A6B3F] text-[#FFF8ED] border-2 border-[var(--ok-ink)] font-semibold px-6 py-4 sm:px-8 sm:py-5 rounded-full text-base sm:text-lg shadow-[5px_5px_0_var(--ok-ink)] hover:shadow-[1px_1px_0_var(--ok-ink)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
            >
              <MessageCircle size={20} className="group-hover:rotate-12 transition-transform" />
              {t.quote.whatsapp}
              <span dir="ltr" className="text-base">
                {WHATSAPP}
              </span>
            </a>
          </div>
          {sent && <p className="sm:col-span-2 text-center text-[var(--ok-success-text)] font-semibold">{t.quote.sent}</p>}
          {failed && <p className="sm:col-span-2 text-center text-[var(--ok-error-text)] font-semibold">{t.quote.failed}</p>}
        </form>
      </section>

      {/* ───── FAQ ───── */}
      <section id="faq" className="bg-[var(--ok-paper-2)] border-y-2 border-[var(--ok-ink)]">
        <div className="ok-container py-16 sm:py-20 md:py-24 lg:py-28">
          <p className="font-hand text-xl sm:text-2xl lg:text-3xl -rotate-1 mb-2" style={{ color: ACCENT }}>
            {t.faq.kicker}
          </p>
          <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight mb-8 sm:mb-10">
            {t.faq.title}
          </h2>
          <div className="border-t-2 border-[var(--ok-ink)]">
            {t.faq.items.map((f) => (
              <details key={f.q} className="group border-b-2 border-[var(--ok-ink)] py-5 sm:py-6">
                <summary className="cursor-pointer list-none flex items-start justify-between gap-4">
                  <h3 className="font-display font-bold text-lg sm:text-xl md:text-2xl tracking-tight">{f.q}</h3>
                  <span className="shrink-0 w-8 h-8 rounded-full border-2 border-[var(--ok-ink)] flex items-center justify-center group-open:rotate-45 transition-transform">
                    +
                  </span>
                </summary>
                <p className="mt-3 max-w-3xl text-sm sm:text-base leading-relaxed text-[var(--ok-ink)]/75">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ───── CLOSING ───── */}
      <section className="ok-container py-14 sm:py-16 md:py-20">
        <h2 className="font-display font-black text-2xl sm:text-3xl md:text-4xl tracking-tight max-w-3xl">
          {t.closing.title}
        </h2>
        <p className="mt-4 max-w-3xl text-sm sm:text-base xl:text-lg leading-relaxed text-[var(--ok-ink)]/75">
          {t.closing.body}
        </p>
      </section>

      </main>

      {/* ───── FOOTER ───── */}
      <footer className="border-t-2 border-[var(--ok-ink)] bg-[var(--ok-paper-2)]">
        <div className="ok-container py-8 sm:py-10 lg:py-12 2xl:py-14 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 text-xs sm:text-sm">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <img
              src="/logo-96.webp"
              alt="شعار عُقاب"
              width={24}
              height={24}
              loading="lazy"
              decoding="async"
              className="w-6 h-6 shrink-0 object-contain"
            />

            <span className="font-display font-bold">عُقاب — OKAAB</span>
            <span className="text-[var(--ok-ink)]/75">— {t.tagline}</span>
            {[EMAIL, EMAIL_SALES, EMAIL_SUPPORT].map((m) => (
              <a
                key={m}
                href={`mailto:${m}`}
                dir="ltr"
                className="accent-link transition-colors underline underline-offset-4"
              >
                {m}
              </a>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {t.footer.links.map((l, i) => (
              <a
                key={l}
                href={["#catalog", "#about", "#services", "#quote"][i]}
                className="text-[var(--ok-ink)]/75 accent-link transition-colors"
              >
                {l}
              </a>
            ))}
          </div>
          <p className="text-[var(--ok-ink)]/75">{t.footer.copyright}</p>
        </div>
      </footer>
    </div>
  );
}
