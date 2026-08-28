import { useEffect } from "react";

export function useDocumentLanguage(lang: "ar" | "en") {
  useEffect(() => {
    const root = document.documentElement;
    const previousLang = root.lang;
    const previousDir = root.dir;
    root.lang = lang;
    root.dir = lang === "ar" ? "rtl" : "ltr";
    return () => {
      root.lang = previousLang;
      root.dir = previousDir;
    };
  }, [lang]);
}
