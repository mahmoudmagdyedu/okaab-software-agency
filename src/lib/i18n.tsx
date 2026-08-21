import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import arEG from "@/locales/ar-EG";
import ar from "@/locales/ar";
import en from "@/locales/en";
import fr from "@/locales/fr";
import es from "@/locales/es";
import type { Dict } from "@/locales/ar-EG";

export const LOCALES: Record<string, Dict> = { "ar-EG": arEG, ar, en, fr, es };
export const LOCALE_ORDER = ["ar-EG", "ar", "en", "fr", "es"] as const;
export const DEFAULT_LOCALE = "ar-EG";

type Ctx = { locale: string; setLocale: (l: string) => void; t: Dict };
const I18nContext = createContext<Ctx | null>(null);

export const LOCALE_STORAGE_KEY = "okaab.locale";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<string>(DEFAULT_LOCALE);
  const t: Dict = LOCALES[locale] ?? arEG;

  // Restore the visitor's last chosen language (also set from service pages).
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (saved && LOCALES[saved]) setLocale(saved);
    } catch {
      /* storage unavailable */
    }
  }, []);

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

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}


export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
