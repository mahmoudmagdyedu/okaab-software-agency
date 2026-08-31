import { type PropsWithChildren } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FlyingEagleLogo } from "./eagle-logo";
import { theme } from "./theme";

export function Screen({ children }: PropsWithChildren) {
  return <SafeAreaView edges={["top", "left", "right"]} style={styles.screen}>{children}</SafeAreaView>;
}
export function Title({ children }: PropsWithChildren) {
  return <Text style={styles.title}>{children}</Text>;
}
export function Muted({ children }: PropsWithChildren) {
  return <Text style={styles.muted}>{children}</Text>;
}
export function Card({ children }: PropsWithChildren) {
  return <View style={styles.card}>{children}</View>;
}
export function Action({
  title,
  onPress,
  disabled = false,
  loading = false,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  const inactive = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        pressed && styles.pressed,
        inactive && styles.disabled,
      ]}
    >
      {loading ? (
        <View style={styles.actionLoading}>
          <EagleLoader compact label={null} />
          <Text style={styles.actionText}>جارٍ التنفيذ…</Text>
        </View>
      ) : (
        <Text style={styles.actionText}>{title}</Text>
      )}
    </Pressable>
  );
}
export function Loading() {
  return <EagleLoader />;
}

export function EagleLoader({
  label = "بنجهّز المحتوى ليك…",
  compact = false,
}: {
  label?: string | null;
  compact?: boolean;
}) {
  return (
    <View accessibilityRole="progressbar" accessibilityLabel={label || "جارٍ التحميل"} style={compact ? styles.compactCenter : styles.center}>
      <View style={compact ? styles.compactStage : styles.flightStage}>
        {!compact ? <View style={styles.logoAura} /> : null}
        <View style={compact ? styles.compactEagle : styles.eagleVector}>
          <FlyingEagleLogo color={theme.colors.ink} />
        </View>
        {!compact ? <View style={styles.trail}><View style={styles.trailCore} /></View> : null}
      </View>
      {!compact && label ? (
        <>
          <Text style={styles.loadingTitle}>عُقاب يحلّق بك</Text>
          <Muted>{label}</Muted>
        </>
      ) : null}
    </View>
  );
}
export function ErrorState({ message, retry }: { message: string; retry: () => void }) {
  return (
    <Card>
      <Title>تعذّر تحميل الصفحة</Title>
      <Muted>{message}</Muted>
      <Action title="حاول مرة أخرى" onPress={retry} />
    </Card>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.paper, paddingHorizontal: 18, paddingTop: 8 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, backgroundColor: theme.colors.paper },
  compactCenter: { alignItems: "center", justifyContent: "center" },
  flightStage: { width: 190, height: 126, alignItems: "center", justifyContent: "center" },
  compactStage: { width: 42, height: 26, alignItems: "center", justifyContent: "center" },
  eagleVector: { width: 174, height: 101, zIndex: 2 },
  compactEagle: { width: 42, height: 24 },
  logoAura: {
    position: "absolute",
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: "rgba(232,163,61,.16)",
    borderWidth: 1,
    borderColor: "rgba(232,163,61,.32)",
  },
  trail: {
    position: "absolute",
    bottom: 2,
    width: 92,
    height: 3,
    borderRadius: 3,
    backgroundColor: "rgba(24,21,17,.12)",
    overflow: "hidden",
  },
  trailCore: { width: "62%", height: "100%", alignSelf: "center", borderRadius: 3, backgroundColor: theme.colors.gold },
  loadingTitle: { color: theme.colors.ink, fontSize: 18, fontFamily: theme.font.bold },
  title: {
    color: theme.colors.ink,
    fontSize: 22,
    fontFamily: theme.font.bold,
    textAlign: "right",
    writingDirection: "rtl",
  },
  muted: {
    color: theme.colors.ink,
    opacity: 0.68,
    fontSize: 14,
    fontFamily: theme.font.regular,
    lineHeight: 22,
    textAlign: "right",
    writingDirection: "rtl",
  },
  card: {
    backgroundColor: theme.colors.card,
    borderColor: `${theme.colors.ink}22`,
    borderWidth: 1,
    borderRadius: theme.radius.md,
    padding: 16,
    gap: 8,
  },
  action: {
    minHeight: 48,
    backgroundColor: theme.colors.gold,
    borderRadius: theme.radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  actionLoading: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 8 },
  actionText: { color: theme.colors.ink, fontFamily: theme.font.bold, fontSize: 15 },
  pressed: { opacity: 0.82 },
  disabled: { opacity: 0.55 },
});
