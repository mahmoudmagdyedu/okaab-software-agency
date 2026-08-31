import { type PropsWithChildren, useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

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
  return <ContentSkeleton />;
}

function ContentSkeleton() {
  const reduceMotion = useReducedMotion();
  const pulse = useSharedValue(0.45);

  useEffect(() => {
    if (reduceMotion) {
      pulse.value = 0.65;
      return;
    }
    pulse.value = withRepeat(
      withSequence(
        withTiming(0.82, { duration: 780, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.42, { duration: 780, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );
    return () => cancelAnimation(pulse);
  }, [pulse, reduceMotion]);

  const pulseStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

  return (
    <View accessibilityRole="progressbar" accessibilityLabel="جارٍ تحميل المحتوى" style={styles.skeletonPage}>
      <View style={styles.skeletonBrandRow}>
        <View style={styles.skeletonMiniLogo}><FlyingEagleLogo color={theme.colors.gold} /></View>
        <Animated.View style={[styles.skeletonTitle, pulseStyle]} />
      </View>
      <Animated.View style={[styles.skeletonHero, pulseStyle]} />
      <Animated.View style={[styles.skeletonLineWide, pulseStyle]} />
      <Animated.View style={[styles.skeletonLineShort, pulseStyle]} />
      <View style={styles.skeletonCards}>
        <Animated.View style={[styles.skeletonCard, pulseStyle]} />
        <Animated.View style={[styles.skeletonCard, pulseStyle]} />
        <Animated.View style={[styles.skeletonCardSmall, pulseStyle]} />
      </View>
    </View>
  );
}

export function EagleLoader({
  label = "بنجهّز رحلتك التعليمية…",
  compact = false,
}: {
  label?: string | null;
  compact?: boolean;
}) {
  return (
    <View accessibilityRole="progressbar" accessibilityLabel={label || "جارٍ التحميل"} style={compact ? styles.compactCenter : styles.center}>
      <View style={compact ? styles.compactStage : styles.flightStage}>
        {!compact ? (
          <>
            <View style={styles.logoAuraOuter} />
            <View style={styles.logoAura} />
            <View style={styles.orbitDot} />
          </>
        ) : null}
        <View style={compact ? styles.compactEagle : styles.eagleVector}>
          <FlyingEagleLogo color={theme.colors.ink} />
        </View>
        {!compact ? <View style={styles.trail}><View style={styles.trailCore} /></View> : null}
      </View>
      {!compact && label ? (
        <>
          <Text style={styles.loadingTitle}>عُقاب</Text>
          <Text style={styles.loadingKicker}>تَعَلَّمْ • تَقَدَّمْ • حَلِّقْ</Text>
          <Muted>{label}</Muted>
        </>
      ) : null}
    </View>
  );
}
export function ErrorState({ message, retry }: { message: string; retry: () => void }) {
  return (
    <View style={styles.errorWrap}>
      <Card>
        <View style={styles.errorMark}><Text style={styles.errorMarkText}>!</Text></View>
        <Title>تعذّر تحميل المحتوى</Title>
        <Muted>{message}</Muted>
        <Text style={styles.errorHint}>تأكد من اتصال الإنترنت ثم حاول مرة أخرى.</Text>
        <Action title="إعادة المحاولة" onPress={retry} />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.paper, paddingHorizontal: 18, paddingTop: 8 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, backgroundColor: theme.colors.paper },
  compactCenter: { alignItems: "center", justifyContent: "center" },
  flightStage: { width: 210, height: 150, alignItems: "center", justifyContent: "center" },
  compactStage: { width: 42, height: 26, alignItems: "center", justifyContent: "center" },
  eagleVector: { width: 176, height: 102, zIndex: 3 },
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
  logoAuraOuter: {
    position: "absolute",
    width: 144,
    height: 144,
    borderRadius: 72,
    borderWidth: 1,
    borderColor: "rgba(232,163,61,.16)",
  },
  orbitDot: {
    position: "absolute",
    top: 17,
    right: 43,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.gold,
    shadowColor: theme.colors.gold,
    shadowOpacity: 0.7,
    shadowRadius: 8,
    elevation: 3,
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
  loadingTitle: { color: theme.colors.ink, fontSize: 28, fontFamily: theme.font.bold, marginTop: -2 },
  loadingKicker: { color: theme.colors.gold, fontSize: 10, letterSpacing: 2.4, fontFamily: theme.font.bold },
  skeletonPage: { flex: 1, backgroundColor: theme.colors.paper, paddingHorizontal: 20, paddingTop: 28, paddingBottom: 104 },
  skeletonBrandRow: { flexDirection: "row-reverse", alignItems: "center", gap: 12, marginBottom: 22 },
  skeletonMiniLogo: { width: 44, height: 28 },
  skeletonTitle: { width: 132, height: 20, borderRadius: 10, backgroundColor: "rgba(24,21,17,.13)" },
  skeletonHero: { height: 132, borderRadius: 28, backgroundColor: "rgba(24,21,17,.10)", marginBottom: 22 },
  skeletonLineWide: { width: "72%", height: 16, borderRadius: 8, backgroundColor: "rgba(24,21,17,.12)", alignSelf: "flex-end", marginBottom: 10 },
  skeletonLineShort: { width: "45%", height: 12, borderRadius: 6, backgroundColor: "rgba(24,21,17,.09)", alignSelf: "flex-end", marginBottom: 24 },
  skeletonCards: { gap: 12 },
  skeletonCard: { height: 94, borderRadius: 20, backgroundColor: "rgba(24,21,17,.08)", borderWidth: 1, borderColor: "rgba(24,21,17,.06)" },
  skeletonCardSmall: { height: 68, borderRadius: 20, backgroundColor: "rgba(24,21,17,.07)", borderWidth: 1, borderColor: "rgba(24,21,17,.05)" },
  errorWrap: { flex: 1, justifyContent: "center", paddingHorizontal: 2, paddingBottom: 92 },
  errorMark: { width: 42, height: 42, borderRadius: 21, alignSelf: "flex-end", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(232,163,61,.16)", borderWidth: 1, borderColor: "rgba(232,163,61,.42)" },
  errorMarkText: { color: theme.colors.gold, fontSize: 22, fontFamily: theme.font.bold },
  errorHint: { color: theme.colors.ink, opacity: 0.5, fontSize: 12, lineHeight: 19, fontFamily: theme.font.regular, textAlign: "right" },
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
