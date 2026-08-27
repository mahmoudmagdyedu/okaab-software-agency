import { ClerkProvider } from "@clerk/tanstack-react-start";
import { arSA } from "@clerk/localizations";
import type { ReactNode } from "react";

const OKAAB_ARABIC_LOCALIZATION = {
  ...arSA,
  formFieldInputPlaceholder__emailAddress: "أدخل بريدك الإلكتروني",
  formFieldInputPlaceholder__password: "أدخل كلمة المرور",
  formFieldInputPlaceholder__signUpPassword: "أنشئ كلمة مرور قوية",
};

/**
 * Keeps Clerk's client runtime out of public route bundles. Only authentication
 * and admin pages should render this boundary.
 */
export function ClerkBoundary({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider
      localization={OKAAB_ARABIC_LOCALIZATION}
      {...(import.meta.env.PROD ? { proxyUrl: "/clerk-proxy" } : {})}
    >
      {children}
    </ClerkProvider>
  );
}
