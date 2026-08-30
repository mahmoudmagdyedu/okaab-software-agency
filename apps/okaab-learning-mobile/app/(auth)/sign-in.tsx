import { useSignIn, useSSO } from "@clerk/expo";
import { makeRedirectUri } from "expo-auth-session";
import { Link, router } from "expo-router";
import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Action, Muted, Title } from "@/components";
import { theme } from "@/theme";

type Mode = "auth" | "forgot-code" | "forgot-password";

function message(value: unknown) {
  const error = value as { code?: string; message?: string; errors?: { message?: string; longMessage?: string; code?: string }[] };
  const code = error?.errors?.[0]?.code || error?.code;
  const raw = `${error?.errors?.[0]?.longMessage || ""} ${error?.errors?.[0]?.message || ""} ${error?.message || ""}`;
  if (code === "form_password_incorrect") return "كلمة المرور غير صحيحة. حاول مرة أخرى أو استعد حسابك.";
  if (code === "form_identifier_not_found") return "لا يوجد حساب بهذا البريد. أنشئ حسابًا جديدًا للبدء.";
  if (code === "session_exists") return "أنت مسجّل الدخول بالفعل.";
  if (/authorized redirect|redirect uri|redirect_url/i.test(raw)) {
    return "تعذّر الرجوع إلى تطبيق عُقاب بعد تسجيل Google. حدّث التطبيق ثم أعد المحاولة.";
  }
  return error?.errors?.[0]?.longMessage || error?.errors?.[0]?.message || error?.message || "راجع البيانات وحاول مرة أخرى";
}

export default function SignInScreen() {
  const { signIn, fetchStatus } = useSignIn();
  const { startSSOFlow } = useSSO();
  const [mode, setMode] = useState<Mode>("auth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const insets = useSafeAreaInsets();
  const busy = fetchStatus === "fetching";
  const done = () => router.replace("/(tabs)");
  const googleRedirectUrl = makeRedirectUri({ scheme: "okaab", path: "sso-callback" });

  const submit = async () => {
    setError("");
    const result = await signIn.password({ emailAddress: email.trim(), password });
    if (!result.error && signIn.status === "complete") {
      await signIn.finalize({ navigate: done });
      return;
    }
    if (result.error?.code === "form_identifier_not_found") {
      setError("لا يوجد حساب بهذا البريد. اختر «إنشاء حساب» للبدء.");
      return;
    }
    if (result.error) setError(message(result.error));
  };

  const startForgotPassword = async () => {
    if (!email.trim()) {
      setError("اكتب بريدك الإلكتروني أولًا.");
      return;
    }
    setError("");
    const created = await signIn.create({ identifier: email.trim() });
    if (created.error) {
      setError(message(created.error));
      return;
    }
    const sent = await signIn.resetPasswordEmailCode.sendCode();
    if (sent.error) {
      setError(message(sent.error));
      return;
    }
    setCode("");
    setMode("forgot-code");
  };

  const verifyResetCode = async () => {
    setError("");
    const result = await signIn.resetPasswordEmailCode.verifyCode({ code });
    if (result.error) {
      setError(message(result.error));
      return;
    }
    setNewPassword("");
    setMode("forgot-password");
  };

  const resetPassword = async () => {
    setError("");
    const result = await signIn.resetPasswordEmailCode.submitPassword({
      password: newPassword,
      signOutOfOtherSessions: true,
    });
    if (result.error) {
      setError(message(result.error));
      return;
    }
    if (signIn.status === "complete") await signIn.finalize({ navigate: done });
  };

  const google = async () => {
    setError("");
    try {
      const { createdSessionId, setActive, signUp } = await startSSOFlow({
        strategy: "oauth_google",
        redirectUrl: googleRedirectUrl,
      });
      if (createdSessionId) {
        await setActive?.({ session: createdSessionId });
        done();
      } else if (signUp?.status === "missing_requirements") {
        setError("يحتاج حساب Google إلى بيانات إضافية. جرّب إنشاء الحساب بالبريد مرة واحدة.");
      }
    } catch (value) {
      const code = (value as { code?: string })?.code;
      if (code === "SIGN_IN_CANCELLED" || code === "-5") return;
      setError(message(value));
    }
  };

  const heading = mode === "forgot-code" ? "رمز استعادة الحساب" : mode === "forgot-password" ? "كلمة مرور جديدة" : "مرحبًا بعودتك";
  const description = mode === "auth" ? "سجّل الدخول وواصل مسارك من حيث توقفت." : mode === "forgot-password" ? "اختر كلمة قوية لا تقل عن 8 أحرف." : `أرسلنا رمزًا إلى ${email}`;

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.page,
          { paddingTop: Math.max(insets.top, 28), paddingBottom: Math.max(insets.bottom, 28) },
        ]}
      >
        <Animated.View entering={FadeInDown.duration(420).springify().damping(18)} style={styles.brandRow}>
          <Image source={require("../../assets/okaab-icon-v2.png")} style={styles.logo} />
          <View style={styles.brandCopy}>
            <Text style={styles.brand}>عُقاب</Text>
            <Text style={styles.tagline}>تعلّم. اختبر. حلّق.</Text>
          </View>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(80).duration(480).springify().damping(18)} style={styles.form}>
          <View style={styles.secureChip}><Text style={styles.secureChipText}>دخول آمن ومشفّر</Text><Text style={styles.secureDot}>●</Text></View>
          <Title>{heading}</Title>
          <Muted>{description}</Muted>
          {mode === "auth" && (
            <>
              <FieldLabel>البريد الإلكتروني</FieldLabel>
              <TextInput accessibilityLabel="البريد الإلكتروني" autoCapitalize="none" autoComplete="email" inputMode="email" placeholder="name@example.com" placeholderTextColor="#71695F" value={email} onChangeText={setEmail} style={styles.input} />
              <FieldLabel>كلمة المرور</FieldLabel>
              <TextInput accessibilityLabel="كلمة المرور" autoComplete="password" secureTextEntry placeholder="8 أحرف أو أكثر" placeholderTextColor="#71695F" value={password} onChangeText={setPassword} style={styles.input} />
              <Action title="تسجيل الدخول" onPress={() => void submit()} disabled={!email.trim() || password.length < 8} loading={busy} />
              <View style={styles.linksRow}>
                <Pressable onPress={() => void startForgotPassword()} style={styles.textButton}><Text style={styles.textButtonLabel}>نسيت كلمة المرور؟</Text></Pressable>
                <Link href="/(auth)/sign-up" asChild><Pressable style={styles.textButton}><Text style={styles.textButtonLabel}>إنشاء حساب</Text></Pressable></Link>
              </View>
              <View style={styles.divider}><View style={styles.line} /><Text style={styles.or}>أو</Text><View style={styles.line} /></View>
              <Pressable accessibilityRole="button" disabled={busy} onPress={() => void google()} style={styles.google}>
                <Text style={styles.googleG}>G</Text><Text style={styles.googleText}>المتابعة بحساب Google</Text>
              </Pressable>
            </>
          )}
          {mode === "forgot-code" && (
            <>
              <FieldLabel>رمز التحقق</FieldLabel>
              <TextInput accessibilityLabel="رمز التحقق" autoComplete="one-time-code" inputMode="numeric" maxLength={6} placeholder="000000" value={code} onChangeText={setCode} style={[styles.input, styles.code]} />
              <Action title="تحقق من الرمز" onPress={() => void verifyResetCode()} disabled={code.length < 6} loading={busy} />
              <Pressable onPress={() => setMode("auth")}><Text style={styles.textButtonLabel}>العودة</Text></Pressable>
            </>
          )}
          {mode === "forgot-password" && (
            <>
              <FieldLabel>كلمة المرور الجديدة</FieldLabel>
              <TextInput accessibilityLabel="كلمة المرور الجديدة" autoComplete="new-password" secureTextEntry value={newPassword} onChangeText={setNewPassword} style={styles.input} />
              <Action title="حفظ والدخول" onPress={() => void resetPassword()} disabled={newPassword.length < 8} loading={busy} />
            </>
          )}
          {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <Text style={styles.label}>{children}</Text>;
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  page: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 20, gap: 14 },
  brandRow: { flexDirection: "row-reverse", alignItems: "center", gap: 12, alignSelf: "flex-end", backgroundColor: "#11100EF0", borderRadius: 24, paddingVertical: 10, paddingHorizontal: 14, borderWidth: 1, borderColor: "#E8A33D55" },
  logo: { width: 56, height: 56, resizeMode: "contain" },
  brandCopy: { alignItems: "flex-end" },
  brand: { color: theme.colors.gold, fontSize: 29, fontWeight: "900" },
  tagline: { color: "#F6F1E7", opacity: 0.78, fontWeight: "700" },
  form: { gap: 12, backgroundColor: "#F6F1E7F2", borderWidth: 1.5, borderColor: "#181511", borderRadius: 30, padding: 20, shadowColor: "#000", shadowOpacity: 0.32, shadowRadius: 22, shadowOffset: { width: 0, height: 10 }, elevation: 10 },
  secureChip: { alignSelf: "flex-end", flexDirection: "row-reverse", alignItems: "center", gap: 6, backgroundColor: "#1815110D", borderRadius: 99, paddingHorizontal: 10, paddingVertical: 6 },
  secureChipText: { color: theme.colors.ink, opacity: 0.68, fontSize: 11, fontWeight: "800" },
  secureDot: { color: theme.colors.success, fontSize: 10 },
  label: { color: theme.colors.ink, textAlign: "right", fontWeight: "900", marginTop: 2 },
  input: { minHeight: 52, borderWidth: 1.5, borderColor: `${theme.colors.ink}66`, borderRadius: 14, paddingHorizontal: 14, color: theme.colors.ink, textAlign: "right", backgroundColor: "#FFFDF8D9" },
  code: { textAlign: "center", fontSize: 22, letterSpacing: 8, writingDirection: "ltr" },
  textButton: { minHeight: 42, justifyContent: "center" },
  textButtonLabel: { color: "#A76500", textAlign: "center", fontWeight: "900", padding: 8 },
  linksRow: { flexDirection: "row", justifyContent: "space-between" },
  divider: { flexDirection: "row", alignItems: "center", gap: 10 },
  line: { height: 1, flex: 1, backgroundColor: `${theme.colors.ink}32` },
  or: { color: theme.colors.ink, opacity: 0.65 },
  google: { minHeight: 50, flexDirection: "row-reverse", gap: 10, borderWidth: 1.5, borderColor: theme.colors.ink, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFFC9" },
  googleG: { color: "#4285F4", fontWeight: "900", fontSize: 18 },
  googleText: { color: theme.colors.ink, fontWeight: "900" },
  error: { color: theme.colors.error, backgroundColor: "#FFF4F2", borderWidth: 1, borderColor: theme.colors.error, borderRadius: 12, padding: 12, textAlign: "right", lineHeight: 21 },
});
