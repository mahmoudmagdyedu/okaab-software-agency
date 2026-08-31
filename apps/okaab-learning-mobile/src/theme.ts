import tokens from "@okaab/design-tokens";

export const theme = {
  ...tokens,
  font: {
    regular: "IBMPlexSansArabic_400Regular",
    medium: "IBMPlexSansArabic_500Medium",
    semibold: "IBMPlexSansArabic_600SemiBold",
    bold: "IBMPlexSansArabic_700Bold",
  },
} as const;
