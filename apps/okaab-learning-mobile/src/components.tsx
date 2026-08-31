import { useEffect, type PropsWithChildren } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
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
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";

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

function Wing({ mirrored = false }: { mirrored?: boolean }) {
  return (
    <Svg width={54} height={40} viewBox="0 0 54 40" style={mirrored ? styles.mirroredWing : undefined}>
      <Defs>
        <LinearGradient id="wingGold" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#FFD06A" />
          <Stop offset="0.55" stopColor="#E8A33D" />
          <Stop offset="1" stopColor="#9B5B08" />
        </LinearGradient>
      </Defs>
      <Path d="M52 33C39 34 26 31 6 17c12 3 22 2 34-5-7 8-14 11-22 12 12 3 22 3 34 1-7 5-14 7-23 7 8 3 15 5 23 1Z" fill="url(#wingGold)" />
      <Path d="M45 32c-9-2-18-7-29-15 7 8 14 14 23 18l6-3Z" fill="#F8BC45" opacity={0.62} />
    </Svg>
  );
}

function EagleBody() {
  return (
    <Svg width={76} height={56} viewBox="0 0 76 56">
      <Defs>
        <LinearGradient id="bodyGold" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#FFD878" />
          <Stop offset="0.52" stopColor="#E8A33D" />
          <Stop offset="1" stopColor="#A76309" />
        </LinearGradient>
      </Defs>
      <Path d="M16 34c9-18 24-27 43-23l-9 7 15 4-12 6c-2 12-10 20-23 24 4-7 5-13 2-18-5 5-10 8-18 9 3-3 4-6 2-9Z" fill="url(#bodyGold)" />
      <Path d="m55 17 18 7-13 5-8-4 3-8Z" fill="#F5B335" />
      <Path d="M32 34c5-6 11-9 20-9-4 4-7 8-8 14l-12-5Z" fill="#181511" opacity={0.92} />
      <Path d="M24 38c7 2 12 6 16 12-8-2-14-5-18-9l2-3Z" fill="#2A2723" />
      <Path d="M57 18c2 0 3 1 3 3-2 1-4 1-5-1l2-2Z" fill="#181511" />
    </Svg>
  );
}

export function EagleLoader({
  label = "بنجهّز المحتوى ليك…",
  compact = false,
}: {
  label?: string | null;
  compact?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const flight = useSharedValue(0.35);

  useEffect(() => {
    if (reduceMotion) {
      flight.value = 0.35;
      return;
    }
    flight.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 420, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 520, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );
    return () => cancelAnimation(flight);
  }, [flight, reduceMotion]);

  const bodyStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(flight.value, [0, 1], [2, -3]) }],
  }));
  const leftWingStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: 22 },
      { translateY: 14 },
      { rotateZ: `${interpolate(flight.value, [0, 1], [15, -24])}deg` },
      { translateX: -22 },
      { translateY: -14 },
    ],
  }));
  const rightWingStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: -22 },
      { translateY: 14 },
      { rotateZ: `${interpolate(flight.value, [0, 1], [-15, 24])}deg` },
      { translateX: 22 },
      { translateY: -14 },
    ],
  }));
  const trailStyle = useAnimatedStyle(() => ({
    opacity: interpolate(flight.value, [0, 1], [0.18, 0.52]),
    transform: [{ scaleX: interpolate(flight.value, [0, 1], [0.62, 1]) }],
  }));

  return (
    <View accessibilityRole="progressbar" accessibilityLabel={label || "جارٍ التحميل"} style={compact ? styles.compactCenter : styles.center}>
      <View style={compact ? styles.compactStage : styles.flightStage}>
        <Animated.View style={[styles.trail, trailStyle]} />
        <View style={compact ? styles.compactEagle : styles.eagleVector}>
          <Animated.View style={[styles.leftWing, leftWingStyle]}><Wing /></Animated.View>
          <Animated.View style={[styles.rightWing, rightWingStyle]}><Wing mirrored /></Animated.View>
          <Animated.View style={[styles.body, bodyStyle]}><EagleBody /></Animated.View>
        </View>
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
  flightStage: { width: 170, height: 94, alignItems: "center", justifyContent: "center" },
  compactStage: { width: 48, height: 28, alignItems: "center", justifyContent: "center", transform: [{ scale: 0.38 }] },
  eagleVector: { width: 150, height: 68, alignItems: "center", justifyContent: "center" },
  compactEagle: { width: 150, height: 68, alignItems: "center", justifyContent: "center" },
  leftWing: { position: "absolute", left: 7, top: 15, width: 54, height: 40 },
  rightWing: { position: "absolute", right: 7, top: 15, width: 54, height: 40 },
  body: { position: "absolute", left: 37, top: 3, width: 76, height: 56, zIndex: 2 },
  mirroredWing: { transform: [{ scaleX: -1 }] },
  trail: {
    position: "absolute",
    bottom: 0,
    width: 98,
    height: 4,
    borderRadius: 4,
    backgroundColor: theme.colors.gold,
  },
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
