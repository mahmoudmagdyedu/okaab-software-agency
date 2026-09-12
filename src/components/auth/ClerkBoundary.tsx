import { ClerkProvider } from "@clerk/tanstack-react-start";
import { arSA, enUS, esES, frFR } from "@clerk/localizations";
import { useEffect, useState, type ReactNode } from "react";
import { getDocumentNonce } from "@/lib/csp-client";

const OKAAB_ARABIC_LOCALIZATION = {
  ...arSA,
  formFieldInputPlaceholder__emailAddress: "أدخل بريدك الإلكتروني",
  formFieldInputPlaceholder__password: "أدخل كلمة المرور",
  formFieldInputPlaceholder__signUpPassword: "أنشئ كلمة مرور قوية",
};

const CLERK_LOCALIZATIONS = {
  "ar-EG": OKAAB_ARABIC_LOCALIZATION,
  ar: OKAAB_ARABIC_LOCALIZATION,
  en: enUS,
  fr: frFR,
  es: esES,
} as const;

/**
 * Keeps Clerk's client runtime out of public route bundles. Only authentication
 * and admin pages should render this boundary.
 */
export function ClerkBoundary({ children }: { children: ReactNode }) {
  const nonce = getDocumentNonce();
  const [locale, setLocale] = useState<keyof typeof CLERK_LOCALIZATIONS>("ar-EG");

  useEffect(() => {
    const syncLocale = () => {
      try {
        const saved = localStorage.getItem("okaab.locale") as keyof typeof CLERK_LOCALIZATIONS;
        if (saved && CLERK_LOCALIZATIONS[saved]) setLocale(saved);
      } catch {
        /* storage unavailable */
      }
    };
    syncLocale();
    window.addEventListener("okaab:locale-change", syncLocale);
    window.addEventListener("storage", syncLocale);
    return () => {
      window.removeEventListener("okaab:locale-change", syncLocale);
      window.removeEventListener("storage", syncLocale);
    };
  }, []);

  return (
    <ClerkProvider
      {...(nonce ? { nonce } : {})}
      localization={CLERK_LOCALIZATIONS[locale]}
      {...(import.meta.env.PROD ? { proxyUrl: "/__clerk" } : {})}
    >
      {children}
    </ClerkProvider>
  );
}
