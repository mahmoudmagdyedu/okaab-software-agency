import AsyncStorage from "@react-native-async-storage/async-storage";
import tokens from "@okaab/design-tokens";
import {
  createContext,
  createElement,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Appearance, StyleSheet, useColorScheme } from "react-native";

const THEME_KEY = "okaab-learning-theme-v1";

export type ThemePreference = "system" | "light" | "dark";

const lightColors = {
  ...tokens.colors,
  border: "#DDD5C8",
  muted: "#71695F",
  overlay: "rgba(24,21,17,.56)",
  navigation: "#181511",
  navigationText: "#F6F1E7",
  shadow: "#181511",
  input: "#FFF8ED",
} as const;

const darkColors = {
  ...tokens.colors,
  paper: "#100F0E",
  paperAlt: "#181614",
  ink: "#F6F1E7",
  card: "#211D19",
  gold: "#F0AA3A",
  goldLight: "#3A2A16",
  success: "#65C993",
  error: "#FF8D82",
  darkPaper: "#090807",
  darkPaperAlt: "#141210",
  darkInk: "#F6F1E7",
  darkCard: "#211D19",
  border: "#3B352F",
  muted: "#B9B0A5",
  overlay: "rgba(0,0,0,.68)",
  navigation: "#090807",
  navigationText: "#F6F1E7",
  shadow: "#000000",
  input: "#181614",
} as const;

function buildTheme(isDark: boolean) {
  return {
    ...tokens,
    colors: isDark ? darkColors : lightColors,
    isDark,
    font: {
      regular: "IBMPlexSansArabic_400Regular",
      medium: "IBMPlexSansArabic_500Medium",
      semibold: "IBMPlexSansArabic_600SemiBold",
      bold: "IBMPlexSansArabic_700Bold",
    },
  } as const;
}

export type AppTheme = ReturnType<typeof buildTheme>;

export const theme = buildTheme(false);

type ThemeContextValue = {
  theme: AppTheme;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => Promise<void>;
  toggleDarkMode: (enabled: boolean) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme,
  preference: "system",
  setPreference: async () => undefined,
  toggleDarkMode: async () => undefined,
});

export function AppThemeProvider({ children }: PropsWithChildren) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>("system");

  useEffect(() => {
    void AsyncStorage.getItem(THEME_KEY).then((saved) => {
      if (saved === "light" || saved === "dark" || saved === "system") {
        setPreferenceState(saved);
      }
    });
  }, []);

  const setPreference = useCallback(async (next: ThemePreference) => {
    setPreferenceState(next);
    await AsyncStorage.setItem(THEME_KEY, next);
    if (next !== "system") Appearance.setColorScheme(next);
  }, []);

  const isDark = preference === "dark" || (preference === "system" && systemScheme === "dark");
  const activeTheme = useMemo(() => buildTheme(isDark), [isDark]);
  const toggleDarkMode = useCallback(
    async (enabled: boolean) => setPreference(enabled ? "dark" : "light"),
    [setPreference],
  );

  const value = useMemo(
    () => ({ theme: activeTheme, preference, setPreference, toggleDarkMode }),
    [activeTheme, preference, setPreference, toggleDarkMode],
  );

  return createElement(ThemeContext.Provider, { value }, children);
}

export function useAppTheme() {
  return useContext(ThemeContext).theme;
}

export function useThemePreference() {
  return useContext(ThemeContext);
}

export function useThemedStyles(factory: (activeTheme: AppTheme) => any): any {
  const activeTheme = useAppTheme();
  return useMemo(() => StyleSheet.create(factory(activeTheme)), [activeTheme, factory]);
}
