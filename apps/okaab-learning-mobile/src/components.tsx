import { useEffect, type PropsWithChildren } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  Easing,
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

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
      <Text style={styles.actionText}>{loading ? "جارٍ التنفيذ…" : title}</Text>
    </Pressable>
  );
}
export function Loading() {
  return <EagleLoader />;
}

export function EagleLoader({ label = "بنجهّز المحتوى ليك…" }: { label?: string }) {
  const reduceMotion = useReducedMotion();
  const flight = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) {
      flight.value = 0.45;
      return;
    }
    flight.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 460, easing: Easing.out(Easing.cubic) }),
        withTiming(0, { duration: 620, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );
    return () => cancelAnimation(flight);
  }, [flight, reduceMotion]);

  const eagleStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(flight.value, [0, 0.5, 1], [5, -7, 2]) },
      { rotateZ: `${interpolate(flight.value, [0, 0.5, 1], [-5, 4, -2])}deg` },
      { scaleY: interpolate(flight.value, [0, 0.45, 1], [0.88, 1.05, 0.92]) },
      { scaleX: interpolate(flight.value, [0, 0.45, 1], [1.04, 0.96, 1.03]) },
    ],
  }));
  const trailStyle = useAnimatedStyle(() => ({
    opacity: interpolate(flight.value, [0, 0.5, 1], [0.18, 0.82, 0.22]),
    transform: [{ scaleX: interpolate(flight.value, [0, 0.5, 1], [0.45, 1, 0.58]) }],
  }));

  return (
    <View accessibilityRole="progressbar" accessibilityLabel={label} style={styles.center}>
      <View style={styles.flightStage}>
        <Animated.View style={[styles.trail, trailStyle]} />
        <Animated.View style={[styles.eagleHalo, eagleStyle]}>
          <Image source={require("../assets/okaab-icon-foreground.png")} style={styles.eagle} />
        </Animated.View>
      </View>
      <Text style={styles.loadingTitle}>عُقاب يحلّق بك</Text>
      <Muted>{label}</Muted>
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
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  flightStage: { width: 150, height: 94, alignItems: "center", justifyContent: "center" },
  eagleHalo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.ink,
    borderWidth: 1,
    borderColor: `${theme.colors.gold}66`,
    shadowColor: theme.colors.gold,
    shadowOpacity: 0.3,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
    zIndex: 2,
  },
  eagle: { width: 62, height: 62, resizeMode: "contain" },
  trail: {
    position: "absolute",
    bottom: 2,
    width: 98,
    height: 4,
    borderRadius: 4,
    backgroundColor: theme.colors.gold,
  },
  loadingTitle: { color: theme.colors.ink, fontSize: 18, fontWeight: "900" },
  title: {
    color: theme.colors.ink,
    fontSize: 22,
    fontWeight: "700",
    textAlign: "right",
    writingDirection: "rtl",
  },
  muted: {
    color: theme.colors.ink,
    opacity: 0.68,
    fontSize: 14,
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
  actionText: { color: theme.colors.ink, fontWeight: "700", fontSize: 15 },
  pressed: { opacity: 0.82 },
  disabled: { opacity: 0.55 },
});
