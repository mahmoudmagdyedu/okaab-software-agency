import { Link } from "@tanstack/react-router";
import { Languages, Moon, ShieldCheck, Sun, UsersRound } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import { useTheme } from "@/lib/theme";

export type AuthAudience = "learner" | "admin";

const AUTH_LOCALE_EVENT = "okaab:locale-change";
const SUPPORTED_LOCALES = ["ar-EG", "ar", "en", "fr", "es"] as const;
type AuthLocale = (typeof SUPPORTED_LOCALES)[number];

const COPY = {
  ar: {
    heroKicker: "مصمّم للناس اللي بتتحرك بسرعة",
    heroTitle: "حوّل التعلّم إلى إنجاز حقيقي.",
    learner: "طالب",
    admin: "فريق الإدارة",
    adminHint: "سوبر أدمن · أدمن · تيم ليدر · موظف",
    backHome: "العودة للرئيسية",
    themeLight: "تفعيل الوضع الفاتح",
    themeDark: "تفعيل الوضع الداكن",
    language: "اللغة",
  },
  en: {
    heroKicker: "Built for fast-moving people",
    heroTitle: "Turn learning into real progress.",
    learner: "Learner",
    admin: "Admin team",
    adminHint: "Super admin · Admin · Team leader · Employee",
    backHome: "Back to home",
    themeLight: "Switch to light mode",
    themeDark: "Switch to dark mode",
    language: "Language",
  },
  fr: {
    heroKicker: "Pensé pour avancer vite",
    heroTitle: "Transformez l’apprentissage en progrès réel.",
    learner: "Étudiant",
    admin: "Équipe admin",
    adminHint: "Super admin · Admin · Chef d’équipe · Employé",
    backHome: "Retour à l’accueil",
    themeLight: "Activer le mode clair",
    themeDark: "Activer le mode sombre",
    language: "Langue",
  },
  es: {
    heroKicker: "Creado para avanzar rápido",
    heroTitle: "Convierte el aprendizaje en progreso real.",
    learner: "Estudiante",
    admin: "Equipo admin",
    adminHint: "Superadmin · Admin · Líder de equipo · Empleado",
    backHome: "Volver al inicio",
    themeLight: "Activar modo claro",
    themeDark: "Activar modo oscuro",
    language: "Idioma",
  },
} as const;

function readLocale(): AuthLocale {
  if (typeof window === "undefined") return "ar-EG";
  try {
    const value = localStorage.getItem("okaab.locale");
    if (SUPPORTED_LOCALES.includes(value as AuthLocale)) return value as AuthLocale;
  } catch {
    /* storage unavailable */
  }
  return navigator.language.toLowerCase().startsWith("ar") ? "ar-EG" : "en";
}

export function useAuthLocale() {
  const [locale, setLocale] = useState<AuthLocale>("ar-EG");

  useEffect(() => {
    const syncLocale = () => setLocale(readLocale());
    syncLocale();
    window.addEventListener(AUTH_LOCALE_EVENT, syncLocale);
    window.addEventListener("storage", syncLocale);
    return () => {
      window.removeEventListener(AUTH_LOCALE_EVENT, syncLocale);
      window.removeEventListener("storage", syncLocale);
    };
  }, []);

  const changeLocale = (nextLocale: AuthLocale) => {
    try {
      localStorage.setItem("okaab.locale", nextLocale);
    } catch {
      /* storage unavailable */
    }
    setLocale(nextLocale);
    window.dispatchEvent(new Event(AUTH_LOCALE_EVENT));
  };

  return { locale, changeLocale };
}

export function AuthExperience({
  audience,
  children,
}: {
  audience: AuthAudience;
  children: ReactNode;
}) {
  const { theme, toggleTheme } = useTheme();
  const { locale, changeLocale } = useAuthLocale();
  const language = locale.startsWith("ar") ? "ar" : locale;
  const copy = COPY[language as keyof typeof COPY] || COPY.en;
  const dir = language === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [dir, locale]);

  const year = useMemo(() => new Date().getFullYear(), []);

  return (
    <div className="okaab-auth-stage" dir={dir} lang={locale}>
      <div className="okaab-auth-brandbar">
        <Link to="/" className="okaab-auth-logo" aria-label={copy.backHome}>
          <img src="/logo-96.webp" alt="" className="size-11 object-contain sm:size-12" />
          <span>
            <strong>عُقاب</strong>
            <small>OKAAB</small>
          </span>
        </Link>

        <div className="okaab-auth-controls">
          <label className="okaab-auth-language">
            <Languages aria-hidden size={16} />
            <span className="sr-only">{copy.language}</span>
            <select
              aria-label={copy.language}
              value={locale}
              onChange={(event) => changeLocale(event.target.value as AuthLocale)}
            >
              <option value="ar-EG">عربي (مصر)</option>
              <option value="ar">عربي (الخليج)</option>
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="es">Español</option>
            </select>
          </label>
          <button
            type="button"
            className="okaab-auth-theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? copy.themeLight : copy.themeDark}
            title={theme === "dark" ? copy.themeLight : copy.themeDark}
          >
            {theme === "dark" ? <Sun aria-hidden size={18} /> : <Moon aria-hidden size={18} />}
          </button>
        </div>
      </div>

      <section className="okaab-auth-visual" aria-label={copy.heroTitle}>
        <video
          className="okaab-auth-video"
          src="/auth-eagle.mp4"
          poster="/auth-eagle-poster.webp"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden
        />
        <div className="okaab-auth-scrim" aria-hidden />
        <div className="okaab-auth-hero">
          <div className="okaab-auth-kicker">
            <span aria-hidden>↯</span> {copy.heroKicker}
          </div>
          <h1>{copy.heroTitle}</h1>
        </div>
      </section>

      <section className="okaab-auth-pane">
        <main className="okaab-auth-card">
          <nav
            className="okaab-auth-audience"
            aria-label={copy.language === "اللغة" ? "نوع الحساب" : "Account type"}
          >
            <a
              href="/sign-in/"
              className={audience === "learner" ? "is-active" : undefined}
              aria-current={audience === "learner" ? "page" : undefined}
            >
              <UsersRound aria-hidden size={17} />
              {copy.learner}
            </a>
            <Link
              to="/admin/login"
              className={audience === "admin" ? "is-active" : undefined}
              aria-current={audience === "admin" ? "page" : undefined}
            >
              <ShieldCheck aria-hidden size={17} />
              {copy.admin}
            </Link>
          </nav>
          {audience === "admin" ? <p className="okaab-auth-role-hint">{copy.adminHint}</p> : null}
          <div className="okaab-auth-content">{children}</div>
          <p className="okaab-auth-copyright">© {year} OKAAB</p>
        </main>
      </section>
    </div>
  );
}
