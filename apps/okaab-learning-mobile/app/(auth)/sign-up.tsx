import { useClerk, useSignUp } from "@clerk/expo";
import { useSSO } from "@clerk/expo/experimental";
import { Link } from "expo-router";
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
import { navigateAfterAuthentication } from "@/auth-session";
import { type AppTheme, useThemedStyles } from "@/theme";

const GOOGLE_REDIRECT_URL = "okaab://sso-callback";
const MIN_PASSWORD_LENGTH = 15;

export default function SignUpScreen() {
  const styles = useThemedStyles(createStyles);
  const { signUp, fetchStatus } = useSignUp();
  const { setActive } = useClerk();
  const { startSSOFlow } = useSSO();
  const [verify, setVerify] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({});
  const [googleBusy, setGoogleBusy] = useState(false);
  const busy = fetchStatus === "fetching";

  const clearFeedback = () => {
    setError("");
    setNotice("");
    setFieldErrors({});
  };

  const submit = async () => {
    clearFeedback();
    if (!email.trim()) {
      setFieldErrors({ email: "اكتب بريدك الإلكتروني." });
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setFieldErrors({ password: `يجب أن تتكون كلمة المرور من ${MIN_PASSWORD_LENGTH} حرفًا على الأقل.` });
      return;
    }

    const result = await signUp.password({ emailAddress: email.trim(), password });
    if (result.error) {
      const fields = splitFieldErrors(result.error);
      setFieldErrors(fields);
      if (!fields.email && !fields.password) setError(authErrorMessage(result.error));
      return;
    }
    const sent = await signUp.verifications.sendEmailCode();
    if (sent.error) {
      setError(authErrorMessage(sent.error));
      return;
    }
    setCode("");
    setNotice("أرسلنا رمز التحقق. افحص البريد الوارد والرسائل غير المرغوبة.");
    setVerify(true);
  };

  const confirm = async () => {
    clearFeedback();
    const result = await signUp.verifications.verifyEmailCode({ code });
    if (result.error) {
      const fields = splitFieldErrors(result.error);
      setFieldErrors({ code: fields.code || authErrorMessage(result.error) });
      return;
    }
    if (signUp.status === "complete") await signUp.finalize({ navigate: navigateAfterAuthentication });
  };

  const resend = async () => {
    clearFeedback();
    const sent = await signUp.verifications.sendEmailCode();
    if (sent.error) setError(authErrorMessage(sent.error));
    else setNotice("تم إرسال رمز جديد إلى بريدك.");
  };

  const google = async () => {
    clearFeedback();
    setGoogleBusy(true);
    try {
      const result = await startSSOFlow({ strategy: "oauth_google", redirectUrl: GOOGLE_REDIRECT_URL });
      const sessionId = result.createdSessionId
        || result.signIn?.existingSession?.sessionId
        || result.signUp?.existingSession?.sessionId;
      if (sessionId) {
        await setActive({ session: sessionId, navigate: navigateAfterAuthentication });
      } else if (result.authSessionResult?.type && result.authSessionResult.type !== "success") {
        return;
      } else if (result.signUp?.status === "missing_requirements") {
        setError("يحتاج حساب Google إلى بيانات إضافية. أكمل إنشاء الحساب بالبريد الإلكتروني.");
      } else {
        setError("عاد Google دون إنشاء جلسة دخول. أعد المحاولة، وإن استمرت المشكلة أنشئ الحساب بالبريد الإلكتروني.");
      }
    } catch (value) {
      if (!isCancelledAuth(value)) setError(authErrorMessage(value));
    } finally {
      setGoogleBusy(false);
    }
  };

  return (
    <View style={styles.screen}>
      <AuthScreen
        eyebrow={verify ? "خطوة أخيرة لحماية حسابك" : "ابدأ رحلتك مع عُقاب"}
        title={verify ? "أكد بريدك الإلكتروني" : "أنشئ حسابك"}
        description={verify ? `أدخل الرمز المرسل إلى ${email}` : "حساب واحد يحفظ تقدّمك ونقاطك على الموقع والتطبيق."}
      >
        <View nativeID="clerk-captcha" />
        {!verify ? (
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
              autoComplete="new-password"
              placeholder="15 حرفًا على الأقل"
              value={password}
              onChangeText={(value) => { setPassword(value); setFieldErrors((current) => ({ ...current, password: undefined })); }}
            />
            <Text style={styles.hint}>{password.length}/{MIN_PASSWORD_LENGTH} حرفًا كحد أدنى</Text>
            <Action title="إنشاء الحساب" onPress={() => void submit()} disabled={!email.trim() || password.length < MIN_PASSWORD_LENGTH} loading={busy} />
            <Divider />
            <GoogleButton title="إنشاء الحساب عبر Google" loading={googleBusy} disabled={busy} onPress={() => void google()} />
            <Link href="/(auth)/sign-in" asChild>
              <Pressable style={styles.switch}><Text style={styles.switchText}>لديك حساب؟ سجّل الدخول</Text></Pressable>
            </Link>
          </>
        ) : (
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
            <Action title="تأكيد البريد والدخول" onPress={() => void confirm()} disabled={code.length < 6} loading={busy} />
            <View style={styles.linksRow}>
              <TextButton title="إرسال رمز جديد" onPress={() => void resend()} disabled={busy} />
              <TextButton title="تغيير البريد" onPress={() => { clearFeedback(); setVerify(false); signUp.reset(); }} disabled={busy} />
            </View>
          </>
        )}
        {notice ? <Alert success>{notice}</Alert> : null}
        {error ? <Alert>{error}</Alert> : null}
      </AuthScreen>
      {googleBusy ? <AuthProcessingOverlay label="نُجهّز حسابك الآمن عبر Google…" /> : null}
    </View>
  );
}

const createStyles = (theme: AppTheme) => ({
  screen: { flex: 1 },
  hint: { color: theme.colors.muted, fontFamily: theme.font.regular, fontSize: 12, textAlign: "right", marginTop: -6 },
  switch: { minHeight: 44, justifyContent: "center" },
  switchText: { color: theme.colors.gold, fontFamily: theme.font.semibold, fontSize: 14, textAlign: "center" },
  linksRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  codeInput: { textAlign: "center", fontSize: 22, letterSpacing: 8, writingDirection: "ltr" },
});
