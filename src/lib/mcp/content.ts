import arEG from "@/locales/ar-EG";
import en from "@/locales/en";

export const WHATSAPP = "+201228086441";
export const EMAIL_GENERAL = "hello@okaab.org";
export const EMAIL_SALES = "sales@okaab.org";
export const EMAIL_SUPPORT = "support@okaab.org";
export const SITE_URL = "https://okaab.org";

export type Locale = "en" | "ar";

export function dict(locale: Locale) {
  return locale === "ar" ? arEG : en;
}

export function whatsappLink(text?: string) {
  const digits = WHATSAPP.replace(/[^0-9]/g, "");
  return text
    ? `https://wa.me/${digits}?text=${encodeURIComponent(text)}`
    : `https://wa.me/${digits}`;
}
