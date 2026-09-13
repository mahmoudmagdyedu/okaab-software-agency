import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocales } from "expo-localization";
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";

const LANGUAGE_KEY = "okaab-learning-language-v1";
export type AppLanguage = "ar" | "en";

type LanguageContextValue = {
  language: AppLanguage;
  isRtl: boolean;
  setLanguage: (language: AppLanguage) => Promise<void>;
  tr: (arabic: string, english: string) => string;
};

const LanguageContext = createContext<LanguageContextValue>({
  language: "ar",
  isRtl: true,
  setLanguage: async () => undefined,
  tr: (arabic) => arabic,
});

export function AppLanguageProvider({ children }: PropsWithChildren) {
  const deviceLanguage = getLocales()[0]?.languageCode === "en" ? "en" : "ar";
  const [language, setLanguageState] = useState<AppLanguage>(deviceLanguage);

  useEffect(() => {
    void AsyncStorage.getItem(LANGUAGE_KEY).then((saved) => {
      if (saved === "ar" || saved === "en") setLanguageState(saved);
    });
  }, []);

  const setLanguage = useCallback(async (next: AppLanguage) => {
    setLanguageState(next);
    await AsyncStorage.setItem(LANGUAGE_KEY, next);
  }, []);
  const tr = useCallback((arabic: string, english: string) => language === "ar" ? arabic : english, [language]);
  const value = useMemo(
    () => ({ language, isRtl: language === "ar", setLanguage, tr }),
    [language, setLanguage, tr],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useAppLanguage() {
  return useContext(LanguageContext);
}
