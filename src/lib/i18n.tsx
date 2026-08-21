import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import arEG from "@/locales/ar-EG";
import type { Dict } from "@/locales/ar-EG";

export const LOCALE_ORDER = ["ar-EG", "ar", "en", "fr", "es"] as const;
export const DEFAULT_LOCALE = "ar-EG";
export const LOCALE_LABELS: Record<(typeof LOCALE_ORDER)[number], string> = {
  "ar-EG": "مصري",
  ar: "خليجي",
  en: "English",
  fr: "Français",
  es: "Español",
};

const LOCALE_LOADERS: Record<string, () => Promise<Dict>> = {
  "ar-EG": async () => arEG,
  ar: async () => (await import("@/locales/ar")).default,
  en: async () => (await import("@/locales/en")).default,
  fr: async () => (await import("@/locales/fr")).default,
  es: async () => (await import("@/locales/es")).default,
};

type Ctx = { locale: string; setLocale: (l: string) => void; t: Dict };
const I18nContext = createContext<Ctx | null>(null);

export const LOCALE_STORAGE_KEY = "okaab.locale";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<string>(DEFAULT_LOCALE);
  const [t, setTranslations] = useState<Dict>(arEG);

  const loadLocale = useCallback(async (nextLocale: string) => {
    const loader = LOCALE_LOADERS[nextLocale];
    if (!loader) return;
    const translations = await loader();
    setTranslations(translations);
    setLocale(nextLocale);
  }, []);

  // Restore the visitor's last chosen language (also set from service pages).
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (saved && LOCALE_LOADERS[saved]) void loadLocale(saved);
    } catch {
      /* storage unavailable */
    }
  }, [loadLocale]);

  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("lang", t.htmlLang);
    html.setAttribute("dir", t.dir);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      /* storage unavailable */
    }
  }, [t, locale]);

  const value = useMemo(() => ({ locale, setLocale: loadLocale, t }), [locale, loadLocale, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
