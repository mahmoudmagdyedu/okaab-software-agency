import { useClerk, useSignIn } from "@clerk/expo";
import { useSSO } from "@clerk/expo/experimental";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { type AuthFieldErrors, authErrorMessage, isCancelledAuth, splitFieldErrors } from "@/auth-errors";
import {
  Alert,
  AuthProcessingOverlay,
  AuthScreen,
  Divider,
  Field,
  GoogleButton,
  PasswordField,
  TextButton,
} from "@/auth-ui";
import { Action } from "@/components";
import { theme } from "@/theme";

type Mode = "auth" | "forgot-code" | "forgot-password";
const GOOGLE_REDIRECT_URL = "okaab://sso-callback";
const MIN_PASSWORD_LENGTH = 15;

export default function SignInScreen() {
  const { signIn, fetchStatus } = useSignIn();
  const { setActive, client } = useClerk();
  const { startSSOFlow } = useSSO();
  const [mode, setMode] = useState<Mode>("auth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({});
  const [googleBusy, setGoogleBusy] = useState(false);
  const busy = fetchStatus === "fetching";

  const done = () => router.replace("/(tabs)");
  const clearFeedback = () => {
    setError("");
    setNotice("");
    setFieldErrors({});
  };

  const activateExistingSession = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    const matchingClientSession = client?.sessions?.find(
      (session) => session.user?.primaryEmailAddress?.emailAddress.toLowerCase() === normalizedEmail,
    );
    const sessionId = signIn.existingSession?.sessionId || matchingClientSession?.id;
    if (!sessionId) return false;
    await setActive({ session: sessionId });
    done();
    return true;
  };

  const submit = async () => {
    clearFeedback();
    if (!email.trim()) {
      setFieldErrors({ email: "اكتب بريدك الإلكتروني." });
      return;
    }
    if (!password) {
      setFieldErrors({ password: "اكتب كلمة المرور." });
      return;
    }

    const result = await signIn.password({ emailAddress: email.trim(), password });
    if (await activateExistingSession()) return;
    if (!result.error && signIn.status === "complete") {
      await signIn.finalize({ navigate: done });
      return;
    }
    if (result.error) {
      const fields = splitFieldErrors(result.error);
      setFieldErrors(fields);
      if (!fields.email && !fields.password) setError(authErrorMessage(result.error));
    }
  };

  const startForgotPassword = async () => {
    clearFeedback();
    if (!email.trim()) {
      setFieldErrors({ email: "اكتب بريدك الإلكتروني أولًا." });
      return;
    }
    const created = await signIn.create({ identifier: email.trim() });
    if (created.error) {
      setFieldErrors(splitFieldErrors(created.error));
      setError(authErrorMessage(created.error));
      return;
    }
    const sent = await signIn.resetPasswordEmailCode.sendCode();
    if (sent.error) {
      setError(authErrorMessage(sent.error));
      return;
    }
    setCode("");
    setNotice("أرسلنا رمز تحقق جديدًا إلى بريدك.");
    setMode("forgot-code");
  };

  const resendResetCode = async () => {
    clearFeedback();
    const sent = await signIn.resetPasswordEmailCode.sendCode();
    if (sent.error) setError(authErrorMessage(sent.error));
    else setNotice("تم إرسال رمز جديد. افحص البريد الوارد والرسائل غير المرغوبة.");
  };

  const verifyResetCode = async () => {
    clearFeedback();
    const result = await signIn.resetPasswordEmailCode.verifyCode({ code });
    if (result.error) {
      const fields = splitFieldErrors(result.error);
      setFieldErrors({ code: fields.code || authErrorMessage(result.error) });
      return;
    }
    setNewPassword("");
    setMode("forgot-password");
  };

  const resetPassword = async () => {
    clearFeedback();
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setFieldErrors({ password: `يجب أن تتكون كلمة المرور من ${MIN_PASSWORD_LENGTH} حرفًا على الأقل.` });
      return;
    }
    const result = await signIn.resetPasswordEmailCode.submitPassword({
      password: newPassword,
      signOutOfOtherSessions: true,
    });
    if (await activateExistingSession()) return;
    if (result.error) {
      const fields = splitFieldErrors(result.error);
      setFieldErrors({ password: fields.password });
      if (!fields.password) setError(authErrorMessage(result.error));
      return;
    }
    if (signIn.status === "complete") await signIn.finalize({ navigate: done });
  };

  const google = async () => {
    clearFeedback();
    setGoogleBusy(true);
    try {
      const result = await startSSOFlow({ strategy: "oauth_google", redirectUrl: GOOGLE_REDIRECT_URL });
      if (result.createdSessionId || result.signIn?.existingSession || result.signUp?.existingSession) {
        done();
      } else if (result.signUp?.status === "missing_requirements") {
        setError("يحتاج حساب Google إلى بيانات إضافية. أكمل إنشاء الحساب بالبريد الإلكتروني.");
      }
    } catch (value) {
      if (!isCancelledAuth(value)) setError(authErrorMessage(value));
    } finally {
      setGoogleBusy(false);
    }
  };

  const heading = mode === "auth" ? "مرحبًا بعودتك" : mode === "forgot-code" ? "تحقق من بريدك" : "أنشئ كلمة مرور جديدة";
  const description = mode === "auth"
    ? "سجّل الدخول وواصل مسارك من آخر نقطة وصلت إليها."
    : mode === "forgot-code"
      ? `أدخل الرمز المرسل إلى ${email}`
      : "اختر كلمة قوية، وسنفتح حسابك فورًا بعد الحفظ.";

  return (
    <View style={styles.screen}>
      <AuthScreen eyebrow="حساب واحد لكل تقدّمك" title={heading} description={description}>
        {mode === "auth" ? (
          <>
            <Field
              label="البريد الإلكتروني"
              error={fieldErrors.email}
              autoCapitalize="none"
              autoComplete="email"
              inputMode="email"
              placeholder="name@example.com"
              value={email}
              onChangeText={(value) => { setEmail(value); setFieldErrors((current) => ({ ...current, email: undefined })); }}
            />
            <PasswordField
              label="كلمة المرور"
              error={fieldErrors.password}
              autoComplete="password"
              placeholder="اكتب كلمة المرور"
              value={password}
              onChangeText={(value) => { setPassword(value); setFieldErrors((current) => ({ ...current, password: undefined })); }}
            />
            <Action title="تسجيل الدخول" onPress={() => void submit()} disabled={!email.trim() || !password} loading={busy} />
            <View style={styles.linksRow}>
              <TextButton title="نسيت كلمة المرور؟" onPress={() => void startForgotPassword()} disabled={busy} />
              <Link href="/(auth)/sign-up" asChild>
                <Pressable style={styles.link}><Text style={styles.linkText}>إنشاء حساب جديد</Text></Pressable>
              </Link>
            </View>
            <Divider />
            <GoogleButton title="المتابعة بحساب Google" loading={googleBusy} disabled={busy} onPress={() => void google()} />
          </>
        ) : mode === "forgot-code" ? (
          <>
            <Field
              label="رمز التحقق"
              error={fieldErrors.code}
              autoComplete="one-time-code"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChangeText={(value) => { setCode(value.replace(/\D/g, "")); setFieldErrors({}); }}
              style={styles.codeInput}
            />
            <Action title="تحقق من الرمز" onPress={() => void verifyResetCode()} disabled={code.length < 6} loading={busy} />
            <View style={styles.linksRow}>
              <TextButton title="إرسال رمز جديد" onPress={() => void resendResetCode()} disabled={busy} />
              <TextButton title="العودة للدخول" onPress={() => { clearFeedback(); setMode("auth"); }} disabled={busy} />
            </View>
          </>
        ) : (
          <>
            <PasswordField
              label="كلمة المرور الجديدة"
              error={fieldErrors.password}
              autoComplete="new-password"
              placeholder="15 حرفًا على الأقل"
              value={newPassword}
              onChangeText={(value) => { setNewPassword(value); setFieldErrors({}); }}
            />
            <Text style={styles.hint}>{newPassword.length}/{MIN_PASSWORD_LENGTH} حرفًا كحد أدنى</Text>
            <Action title="حفظ والدخول" onPress={() => void resetPassword()} disabled={newPassword.length < MIN_PASSWORD_LENGTH} loading={busy} />
          </>
        )}
        {notice ? <Alert success>{notice}</Alert> : null}
        {error ? <Alert>{error}</Alert> : null}
      </AuthScreen>
      {googleBusy ? <AuthProcessingOverlay label="نُكمل تسجيل الدخول الآمن عبر Google…" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  linksRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  link: { minHeight: 44, justifyContent: "center", paddingHorizontal: 4 },
  linkText: { color: "#9A5B00", fontFamily: theme.font.semibold, fontSize: 14, textAlign: "center" },
  codeInput: { textAlign: "center", fontSize: 22, letterSpacing: 8, writingDirection: "ltr" },
  hint: { color: "#71695F", fontFamily: theme.font.regular, fontSize: 12, textAlign: "right", marginTop: -6 },
});
