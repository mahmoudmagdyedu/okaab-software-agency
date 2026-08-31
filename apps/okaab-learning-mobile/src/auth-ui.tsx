import { Ionicons } from "@expo/vector-icons";
import { type PropsWithChildren, useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { EagleLoader } from "./components";
import { theme } from "./theme";

export function AuthScreen({
  eyebrow,
  title,
  description,
  children,
}: PropsWithChildren<{ eyebrow: string; title: string; description: string }>) {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(1, {
      duration: reduceMotion ? 0 : 480,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, reduceMotion]);

  const introStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * 18 }],
  }));

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.page,
          {
            paddingTop: Math.max(insets.top + 18, 34),
            paddingBottom: Math.max(insets.bottom + 14, 24),
          },
        ]}
      >
        <Animated.View style={[styles.identity, introStyle]}>
          <Text style={styles.brand}>عُقاب</Text>
          <View style={styles.identityRule} />
          <Text style={styles.promise}>تعلّم بوضوح. طبّق بثقة. حلّق أبعد.</Text>
        </Animated.View>

        <Animated.View style={[styles.card, introStyle]}>
          <View style={styles.handle} />
          <Text style={styles.eyebrow}>{eyebrow}</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
          <View style={styles.content}>{children}</View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export function Field({
  label,
  error,
  ...props
}: TextInputProps & { label: string; error?: string }) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...props}
        accessibilityLabel={props.accessibilityLabel || label}
        placeholderTextColor="#756D63"
        style={[styles.input, error ? styles.inputError : null, props.style]}
      />
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

export function PasswordField({
  label,
  error,
  ...props
}: TextInputProps & { label: string; error?: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.passwordBox, error ? styles.inputError : null]}>
        <TextInput
          {...props}
          accessibilityLabel={props.accessibilityLabel || label}
          secureTextEntry={!visible}
          placeholderTextColor="#756D63"
          style={styles.passwordInput}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={visible ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
          hitSlop={8}
          onPress={() => setVisible((value) => !value)}
          style={styles.eyeButton}
        >
          <Ionicons name={visible ? "eye-off-outline" : "eye-outline"} size={21} color={theme.colors.ink} />
        </Pressable>
      </View>
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

export function GoogleButton({
  title,
  loading,
  disabled,
  onPress,
}: {
  title: string;
  loading: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  const inactive = loading || disabled;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ busy: loading, disabled: inactive }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [styles.google, pressed && styles.pressed, inactive && styles.disabled]}
    >
      {loading ? <EagleLoader compact label={null} /> : <Text style={styles.googleMark}>G</Text>}
      <Text style={styles.googleText}>{loading ? "نُكمل الدخول الآمن…" : title}</Text>
    </Pressable>
  );
}

export function Divider() {
  return (
    <View style={styles.divider}>
      <View style={styles.line} />
      <Text style={styles.or}>أو</Text>
      <View style={styles.line} />
    </View>
  );
}

export function TextButton({ title, onPress, disabled = false }: { title: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={styles.textButton}>
      <Text style={[styles.textButtonLabel, disabled && styles.disabledText]}>{title}</Text>
    </Pressable>
  );
}

export function Alert({ children, success = false }: PropsWithChildren<{ success?: boolean }>) {
  return (
    <View accessibilityRole={success ? undefined : "alert"} style={[styles.alert, success && styles.successAlert]}>
      <Ionicons name={success ? "checkmark-circle-outline" : "alert-circle-outline"} size={20} color={success ? theme.colors.success : theme.colors.error} />
      <Text style={[styles.alertText, success && styles.successText]}>{children}</Text>
    </View>
  );
}

export function AuthProcessingOverlay({ label }: { label: string }) {
  return (
    <View style={styles.processing}>
      <View style={styles.processingCard}>
        <EagleLoader label={label} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  page: { flexGrow: 1, justifyContent: "space-between", paddingHorizontal: 16, gap: 28 },
  identity: { alignSelf: "flex-end", alignItems: "flex-end", paddingHorizontal: 8, maxWidth: 330 },
  brand: { color: "#FFF8EC", fontFamily: theme.font.bold, fontSize: 42, lineHeight: 54, textShadowColor: "rgba(0,0,0,.55)", textShadowRadius: 16 },
  identityRule: { width: 42, height: 3, borderRadius: 3, backgroundColor: theme.colors.gold, marginVertical: 7 },
  promise: { color: "#FFF8EC", fontFamily: theme.font.medium, fontSize: 15, textAlign: "right", textShadowColor: "rgba(0,0,0,.75)", textShadowRadius: 10 },
  card: { width: "100%", alignSelf: "center", maxWidth: 520, borderRadius: 30, borderWidth: 1, borderColor: "rgba(255,255,255,.56)", backgroundColor: "rgba(246,241,231,.91)", paddingHorizontal: 20, paddingTop: 12, paddingBottom: 22, shadowColor: "#000", shadowOpacity: 0.28, shadowRadius: 26, shadowOffset: { width: 0, height: 14 }, elevation: 12 },
  handle: { alignSelf: "center", width: 42, height: 4, borderRadius: 4, backgroundColor: "rgba(24,21,17,.22)", marginBottom: 14 },
  eyebrow: { color: "#A76500", fontFamily: theme.font.semibold, fontSize: 12, textAlign: "right", letterSpacing: 0.3 },
  title: { color: theme.colors.ink, fontFamily: theme.font.bold, fontSize: 27, lineHeight: 38, textAlign: "right", marginTop: 2 },
  description: { color: "#5D564D", fontFamily: theme.font.regular, fontSize: 14, lineHeight: 23, textAlign: "right", marginTop: 2 },
  content: { gap: 13, marginTop: 18 },
  fieldGroup: { gap: 6 },
  label: { color: theme.colors.ink, fontFamily: theme.font.semibold, fontSize: 14, textAlign: "right" },
  input: { minHeight: 54, borderWidth: 1, borderColor: "rgba(24,21,17,.28)", borderRadius: 15, paddingHorizontal: 15, color: theme.colors.ink, fontFamily: theme.font.regular, fontSize: 15, textAlign: "right", backgroundColor: "rgba(255,253,248,.82)" },
  inputError: { borderColor: theme.colors.error, backgroundColor: "rgba(255,244,242,.92)" },
  passwordBox: { minHeight: 54, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "rgba(24,21,17,.28)", borderRadius: 15, backgroundColor: "rgba(255,253,248,.82)", overflow: "hidden" },
  passwordInput: { minHeight: 52, flex: 1, paddingHorizontal: 15, color: theme.colors.ink, fontFamily: theme.font.regular, fontSize: 15, textAlign: "right" },
  eyeButton: { width: 52, minHeight: 52, alignItems: "center", justifyContent: "center" },
  fieldError: { color: theme.colors.error, fontFamily: theme.font.medium, fontSize: 12, lineHeight: 18, textAlign: "right" },
  google: { minHeight: 52, flexDirection: "row-reverse", gap: 10, borderWidth: 1, borderColor: "rgba(24,21,17,.55)", borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,.74)" },
  googleMark: { color: "#4285F4", fontSize: 19, fontWeight: "900" },
  googleText: { color: theme.colors.ink, fontFamily: theme.font.semibold, fontSize: 14 },
  pressed: { opacity: 0.82 },
  disabled: { opacity: 0.55 },
  divider: { flexDirection: "row", alignItems: "center", gap: 10 },
  line: { flex: 1, height: 1, backgroundColor: "rgba(24,21,17,.17)" },
  or: { color: "#71695F", fontFamily: theme.font.regular, fontSize: 13 },
  textButton: { minHeight: 44, justifyContent: "center", paddingHorizontal: 4 },
  textButtonLabel: { color: "#9A5B00", fontFamily: theme.font.semibold, fontSize: 14, textAlign: "center" },
  disabledText: { opacity: 0.45 },
  alert: { flexDirection: "row-reverse", alignItems: "flex-start", gap: 9, borderWidth: 1, borderColor: "rgba(194,55,43,.55)", backgroundColor: "rgba(255,244,242,.9)", borderRadius: 13, padding: 11 },
  successAlert: { borderColor: "rgba(27,127,75,.42)", backgroundColor: "rgba(239,252,244,.9)" },
  alertText: { flex: 1, color: theme.colors.error, fontFamily: theme.font.medium, fontSize: 13, lineHeight: 20, textAlign: "right" },
  successText: { color: theme.colors.success },
  processing: { ...StyleSheet.absoluteFill, zIndex: 50, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(24,21,17,.58)", padding: 24 },
  processingCard: { width: "100%", maxWidth: 300, minHeight: 230, borderRadius: 26, overflow: "hidden", backgroundColor: "rgba(246,241,231,.96)" },
});
