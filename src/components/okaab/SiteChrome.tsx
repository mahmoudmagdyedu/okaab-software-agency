import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Menu, X, Sun, Moon, Globe } from "lucide-react";
import { useTheme } from "@/lib/theme";

export const ACCENT = "#E8A33D";
export const ACCENT_HOVER = "#F2B95C";
export const WHATSAPP = "+201555317977";
export const EMAIL = "hello@okaab.org";
export const EMAIL_SALES = "sales@okaab.org";
export const EMAIL_SUPPORT = "support@okaab.org";

export type ChromeLang = "ar" | "en" | "fr" | "es";

type ChromeCopy = {
  dir: "rtl" | "ltr";
  nav: { services: string; why: string; process: string };
  cta: string;
  darkMode: string;
  openMenu: string;
  closeMenu: string;
  brandTagline: string;
  footerLinks: { label: string; hash: string }[];
  courses: string;
  projects: string;
};

export const CHROME: Record<ChromeLang, ChromeCopy> = {
  ar: {
    dir: "rtl",
    nav: { services: "الخدمات", why: "ليه عُقاب", process: "طريقة شغلنا" },
    cta: "اطلب عرض سعر",
    darkMode: "الوضع الليلي",
    openMenu: "افتح القائمة",
    closeMenu: "اقفل القائمة",
    brandTagline: "— تطوير مواقع وتطبيقات في مصر والخليج",
    courses: "الكورسات",
    projects: "المشاريع",
    footerLinks: [
      { label: "الخدمات", hash: "catalog" },
      { label: "طريقة شغلنا", hash: "about" },
      { label: "ليه عُقاب", hash: "services" },
      { label: "اطلب عرض سعر", hash: "quote" },
    ],
  },
  en: {
    dir: "ltr",
    nav: { services: "Services", why: "Why OKAAB", process: "How we work" },
    cta: "Get a quote",
    darkMode: "Dark mode",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    brandTagline: "— Web & mobile development in Egypt and the Gulf",
    courses: "Courses",
    projects: "Projects",
    footerLinks: [
      { label: "Services", hash: "catalog" },
      { label: "How we work", hash: "about" },
      { label: "Why OKAAB", hash: "services" },
      { label: "Get a quote", hash: "quote" },
    ],
  },
  fr: {
    dir: "ltr",
    nav: { services: "Services", why: "Pourquoi OKAAB", process: "Notre méthode" },
    cta: "Demander un devis",
    darkMode: "Mode sombre",
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
    brandTagline: "— Développement web et mobile en Égypte et dans le Golfe",
    courses: "Cours",
    projects: "Projets",
    footerLinks: [
      { label: "Services", hash: "catalog" },
      { label: "Notre méthode", hash: "about" },
      { label: "Pourquoi OKAAB", hash: "services" },
      { label: "Demander un devis", hash: "quote" },
    ],
  },
  es: {
    dir: "ltr",
    nav: { services: "Servicios", why: "Por qué OKAAB", process: "Cómo trabajamos" },
    cta: "Pedir presupuesto",
    darkMode: "Modo oscuro",
    openMenu: "Abrir menú",
    closeMenu: "Cerrar menú",
    brandTagline: "— Desarrollo web y móvil en Egipto y el Golfo",
    courses: "Cursos",
    projects: "Proyectos",
    footerLinks: [
      { label: "Servicios", hash: "catalog" },
      { label: "Cómo trabajamos", hash: "about" },
      { label: "Por qué OKAAB", hash: "services" },
      { label: "Pedir presupuesto", hash: "quote" },
    ],
  },
};

/** Shared visual language (fonts, grain, animations) for inner pages. */
export function OkaabStyles() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
        ::selection { background: ${ACCENT}; color: var(--ok-paper-2); }
        .font-display { font-family: 'Fraunces', 'IBM Plex Sans Arabic', serif; font-variation-settings: 'opsz' 144; }
        .font-hand { font-family: 'Caveat', 'IBM Plex Sans Arabic', cursive; }
        [dir="rtl"] .font-hand { font-family: 'IBM Plex Sans Arabic', sans-serif; font-weight: 600; }
        .paper-grain { background-image: radial-gradient(var(--ok-ink) 0.6px, transparent 0.6px); background-size: 22px 22px; }
        .accent-link:hover { color: ${ACCENT}; }
        .job-row { transition: background 0.25s ease, padding-inline-start 0.25s ease; }
        .job-row:hover { padding-inline-start: 1.5rem; }
        @keyframes okIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
        .ok-in { animation: okIn 0.6s cubic-bezier(.2,.8,.2,1) both; }
        .squiggle-underline {
          background: url("data:image/svg+xml,%3Csvg width='60' height='8' viewBox='0 0 60 8' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 4 Q 7.5 0, 15 4 T 30 4 T 45 4 T 60 4' stroke='%23E8A33D' stroke-width='3' fill='none'/%3E%3C/svg%3E") repeat-x bottom;
          background-size: 60px 8px;
          padding-bottom: 12px;
        }
        @media (prefers-reduced-motion: reduce) { .ok-in { animation: none !important; } }
      `,
      }}
    />
  );
}

/** Navbar for inner pages — links point back to the home page sections. */
export const LANG_LABEL: Record<string, string> = {
  ar: "العربية",
  en: "English",
  fr: "Français",
  es: "Español",
};

const LANG_SWITCH_LABEL: Record<ChromeLang, string> = {
  ar: "اللغة",
  en: "Language",
  fr: "Langue",
  es: "Idioma",
};

/** Persist the chosen language so the home page opens in it too. */
export function rememberLocale(lang: ChromeLang) {
  try {
    localStorage.setItem("okaab.locale", lang === "ar" ? "ar-EG" : lang);
  } catch {
    /* storage unavailable */
  }
}

/** Language switcher for localized inner pages. */
export function LangSwitch({
  lang,
  alternates,
  path,
  onNavigate,
}: {
  lang: ChromeLang;
  alternates: Record<string, string>;
  path: string;
  onNavigate?: () => void;
}) {
  const order = (["ar", "en", "fr", "es"] as const).filter((l) => alternates[l]);
  return (
    <div dir="ltr" className="flex items-center gap-1.5">
      <Globe size={15} aria-hidden className="opacity-60 shrink-0" />
      <span className="sr-only">{LANG_SWITCH_LABEL[lang]}</span>
      {order.map((l) => {
        const href = alternates[l]!;
        const active = href === path;
        return (
          <a
            key={l}
            href={href}
            hrefLang={l}
            lang={l}
            aria-current={active ? "page" : undefined}
            onClick={() => {
              rememberLocale(l);
              onNavigate?.();
            }}
            className={`rounded-full border-2 border-[var(--ok-ink)] px-2.5 py-1 text-xs font-semibold transition-colors ${
              active
                ? "bg-[var(--ok-ink)] text-[var(--ok-paper)]"
                : "bg-transparent text-[var(--ok-ink)]/80 hover:text-[var(--ok-ink)]"
            }`}
          >
            {l.toUpperCase()}
          </a>
        );
      })}
    </div>
  );
}

export function SiteHeader({
  lang = "ar",
  alternates,
  path,
}: {
  lang?: ChromeLang;
  alternates?: Record<string, string>;
  path?: string;
}) {
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const c = CHROME[lang];

  const navLinks = [
    { label: c.nav.services, hash: "catalog" },
    { label: c.nav.why, hash: "services" },
    { label: c.nav.process, hash: "about" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[var(--ok-paper)]/90 backdrop-blur-md border-b-2 border-[var(--ok-ink)]">
      <div className="ok-container h-16 lg:h-18 flex items-center justify-between gap-3">
        <Link to="/" className="flex min-w-0 items-center gap-2">
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
          <span className="font-display font-bold text-lg sm:text-xl tracking-tight truncate">
            عُقاب
          </span>
          <span
            dir="ltr"
            className="font-hand text-base sm:text-lg -rotate-6 ms-1 mt-1 tracking-wide shrink-0 whitespace-nowrap lg:hidden xl:inline"
            style={{ color: "var(--ok-accent-text)" }}
          >
            OKAAB
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-4 xl:gap-7 text-[13px] xl:text-sm font-medium">
          <Link to="/courses" className="accent-link transition-colors whitespace-nowrap">
            {c.courses}
          </Link>
          {navLinks.map((l) => (
            <Link
              key={l.hash}
              to="/"
              hash={l.hash}
              className="accent-link transition-colors whitespace-nowrap"
            >
              {l.label}
            </Link>
          ))}
          {alternates && path && <LangSwitch lang={lang} alternates={alternates} path={path} />}
          <button
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Light mode" : "Dark mode"}
            className="accent-link transition-colors opacity-70 hover:opacity-100"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <Link
            to="/"
            hash="quote"
            className="bg-[var(--ok-ink)] text-[var(--ok-paper)] px-3 xl:px-4 py-2 rounded-full whitespace-nowrap flex items-center gap-1.5 transition-colors border-2 border-[var(--ok-ink)] hover:text-[var(--ok-ink)]"
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = ACCENT)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
          >
            {c.cta} <ArrowUpRight size={15} />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? c.closeMenu : c.openMenu}
          aria-expanded={menuOpen}
          aria-controls="inner-mobile-menu"
          className="lg:hidden w-10 h-10 rounded-full border-2 border-[var(--ok-ink)] flex items-center justify-center shrink-0"
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {menuOpen && (
        <div
          id="inner-mobile-menu"
          className="lg:hidden border-t-2 border-[var(--ok-ink)] bg-[var(--ok-paper)] px-4 sm:px-6 py-4 flex flex-col gap-3 text-base font-medium"
        >
          {navLinks.map((l) => (
            <Link
              key={l.hash}
              to="/"
              hash={l.hash}
              onClick={() => setMenuOpen(false)}
              className="accent-link transition-colors py-1"
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/courses"
            onClick={() => setMenuOpen(false)}
            className="accent-link transition-colors py-1"
          >
            {c.courses}
          </Link>
          {alternates && path && (
            <div className="flex items-center justify-between pt-3 mt-1 border-t border-[var(--ok-ink)]/20">
              <span className="text-sm opacity-70">{LANG_SWITCH_LABEL[lang]}</span>
              <LangSwitch
                lang={lang}
                alternates={alternates}
                path={path}
                onNavigate={() => setMenuOpen(false)}
              />
            </div>
          )}
          <div className="flex items-center justify-between pt-3 mt-1 border-t border-[var(--ok-ink)]/20">
            <span className="text-sm opacity-70">{c.darkMode}</span>
            <button
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Light mode" : "Dark mode"}
              className="w-9 h-9 rounded-full border-2 border-[var(--ok-ink)] flex items-center justify-center shrink-0"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
          <Link
            to="/"
            hash="quote"
            onClick={() => setMenuOpen(false)}
            className="mt-1 bg-[var(--ok-ink)] text-[var(--ok-paper)] px-4 py-3 rounded-full flex items-center justify-center gap-1.5 border-2 border-[var(--ok-ink)]"
          >
            {c.cta} <ArrowUpRight size={16} />
          </Link>
        </div>
      )}
    </nav>
  );
}

export function SiteFooter({ lang = "ar" }: { lang?: ChromeLang }) {
  const c = CHROME[lang];
  return (
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
          <span className="text-[var(--ok-ink)]/75">{c.brandTagline}</span>
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
          <Link to="/courses" className="text-[var(--ok-ink)]/75 accent-link transition-colors">
            {c.courses}
          </Link>
          <Link
            to="/"
            hash="projects"
            className="text-[var(--ok-ink)]/75 accent-link transition-colors"
          >
            {c.projects}
          </Link>
          {c.footerLinks.map((l) => (
            <Link
              key={l.hash}
              to="/"
              hash={l.hash}
              className="text-[var(--ok-ink)]/75 accent-link transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>
        <p className="text-[var(--ok-ink)]/75">© {new Date().getFullYear()} عُقاب OKAAB</p>
      </div>
    </footer>
  );
}
