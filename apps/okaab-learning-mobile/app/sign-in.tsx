import { useSignIn, useSignUp, useSSO } from "@clerk/expo";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { Action, Muted, Screen, Title } from "@/components";
import { theme } from "@/theme";

type Mode = "auth" | "verify-signup" | "forgot-code" | "forgot-password";

function message(value: unknown) {
  const error = value as { errors?: { message?: string; longMessage?: string }[] };
  return (
    error?.errors?.[0]?.longMessage || error?.errors?.[0]?.message || "راجع البيانات وحاول مرة أخرى"
  );
}

export default function SignInScreen() {
  const { signIn, fetchStatus: signInStatus } = useSignIn();
  const { signUp, fetchStatus: signUpStatus } = useSignUp();
  const { startSSOFlow } = useSSO();
  const [mode, setMode] = useState<Mode>("auth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const busy = signInStatus === "fetching" || signUpStatus === "fetching";
  const done = () => router.replace("/");

  const submit = async () => {
    setError("");
    const result = await signIn.password({ emailAddress: email.trim(), password });
    if (!result.error && signIn.status === "complete") {
      await signIn.finalize({ navigate: done });
      return;
    }
    if (result.error?.code === "form_identifier_not_found") {
      const created = await signUp.password({ emailAddress: email.trim(), password });
      if (created.error) {
        setError(message(created.error));
        return;
      }
      await signUp.verifications.sendEmailCode();
      setCode("");
      setMode("verify-signup");
      return;
    }
    if (result.error) setError(message(result.error));
  };

  const confirmSignup = async () => {
    setError("");
    const result = await signUp.verifications.verifyEmailCode({ code });
    if (result.error) {
      setError(message(result.error));
      return;
    }
    if (signUp.status === "complete") await signUp.finalize({ navigate: done });
  };

  const startForgotPassword = async () => {
    if (!email.trim()) {
      setError("اكتب بريدك الإلكتروني الأول");
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
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_google",
        redirectUrl: "okaab://",
      });
      if (createdSessionId) {
        await setActive?.({ session: createdSessionId });
        done();
      }
    } catch (value) {
      setError(message(value));
    }
  };

  const heading =
    mode === "verify-signup"
      ? "أكد بريدك"
      : mode === "forgot-code"
        ? "اكتب رمز الاستعادة"
        : mode === "forgot-password"
          ? "اختار كلمة مرور جديدة"
          : "سجّل أو أنشئ حسابًا";
  const description =
    mode === "auth"
      ? "حساب واحد يحفظ تقدّمك على الموقع والموبايل."
      : mode === "forgot-password"
        ? "استخدم كلمة قوية لا تقل عن 8 أحرف، وسنُنهي الجلسات القديمة لحماية حسابك."
        : `بعثنا رمزًا إلى ${email}`;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <Text style={styles.brand}>عُقاب</Text>
          <Title>{heading}</Title>
          <Muted>{description}</Muted>
        </View>
        <View style={styles.form} nativeID="clerk-captcha">
          {mode === "auth" && (
            <>
              <FieldLabel>البريد الإلكتروني</FieldLabel>
              <TextInput
                accessibilityLabel="البريد الإلكتروني"
                autoCapitalize="none"
                autoComplete="email"
                inputMode="email"
                placeholder="name@example.com"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
              />
              <FieldLabel>كلمة المرور</FieldLabel>
              <TextInput
                accessibilityLabel="كلمة المرور"
                autoComplete="password"
                secureTextEntry
                placeholder="8 أحرف أو أكثر"
                value={password}
                onChangeText={setPassword}
                style={styles.input}
              />
              <Action
                title="متابعة"
                onPress={() => void submit()}
                disabled={!email.trim() || password.length < 8}
                loading={busy}
              />
              <Pressable
                accessibilityRole="button"
                onPress={() => void startForgotPassword()}
                style={styles.textButton}
              >
                <Text style={styles.textButtonLabel}>نسيت كلمة المرور؟</Text>
              </Pressable>
              <View style={styles.divider}>
                <View style={styles.line} />
                <Text style={styles.or}>أو</Text>
                <View style={styles.line} />
              </View>
              <Pressable
                accessibilityRole="button"
                disabled={busy}
                onPress={() => void google()}
                style={styles.google}
              >
                <Text style={styles.googleText}>المتابعة بحساب Google</Text>
              </Pressable>
            </>
          )}
          {(mode === "verify-signup" || mode === "forgot-code") && (
            <>
              <FieldLabel>رمز التحقق</FieldLabel>
              <TextInput
                accessibilityLabel="رمز التحقق"
                autoComplete="one-time-code"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChangeText={setCode}
                style={[styles.input, styles.code]}
              />
              <Action
                title={mode === "verify-signup" ? "تأكيد البريد" : "تحقق من الرمز"}
                onPress={() =>
                  void (mode === "verify-signup" ? confirmSignup() : verifyResetCode())
                }
                disabled={code.length < 6}
                loading={busy}
              />
              <Pressable accessibilityRole="button" onPress={() => setMode("auth")}>
                <Text style={styles.textButtonLabel}>العودة وتغيير البريد</Text>
              </Pressable>
            </>
          )}
          {mode === "forgot-password" && (
            <>
              <FieldLabel>كلمة المرور الجديدة</FieldLabel>
              <TextInput
                accessibilityLabel="كلمة المرور الجديدة"
                autoComplete="new-password"
                secureTextEntry
                placeholder="8 أحرف أو أكثر"
                value={newPassword}
                onChangeText={setNewPassword}
                style={styles.input}
              />
              <Action
                title="حفظ والدخول"
                onPress={() => void resetPassword()}
                disabled={newPassword.length < 8}
                loading={busy}
              />
            </>
          )}
          {error && (
            <Text accessibilityRole="alert" style={styles.error}>
              {error}
            </Text>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <Text style={styles.label}>{children}</Text>;
}

const styles = StyleSheet.create({
  page: { flexGrow: 1, justifyContent: "center", paddingBottom: 36 },
  hero: { marginBottom: 24, gap: 8 },
  brand: { color: theme.colors.gold, fontSize: 34, fontWeight: "900", textAlign: "right" },
  form: {
    gap: 12,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: `${theme.colors.ink}33`,
    borderRadius: theme.radius.lg,
    padding: 16,
  },
  label: { color: theme.colors.ink, textAlign: "right", fontWeight: "800", marginTop: 2 },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: `${theme.colors.ink}55`,
    borderRadius: theme.radius.md,
    paddingHorizontal: 14,
    color: theme.colors.ink,
    textAlign: "right",
    backgroundColor: theme.colors.paperAlt,
  },
  code: { textAlign: "center", fontSize: 22, letterSpacing: 8, writingDirection: "ltr" },
  textButton: { minHeight: 44, justifyContent: "center" },
  textButtonLabel: {
    color: theme.colors.gold,
    textAlign: "center",
    fontWeight: "800",
    padding: 10,
  },
  divider: { flexDirection: "row", alignItems: "center", gap: 10 },
  line: { height: 1, flex: 1, backgroundColor: `${theme.colors.ink}25` },
  or: { color: theme.colors.ink, opacity: 0.55 },
  google: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: theme.colors.ink,
    borderRadius: theme.radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  googleText: { color: theme.colors.ink, fontWeight: "800" },
  error: {
    color: theme.colors.error,
    backgroundColor: `${theme.colors.error}0D`,
    borderWidth: 1,
    borderColor: theme.colors.error,
    borderRadius: theme.radius.sm,
    padding: 12,
    textAlign: "right",
    lineHeight: 21,
  },
});
