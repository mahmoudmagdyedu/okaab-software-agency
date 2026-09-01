import { useClerk, useSignIn } from "@clerk/expo";
import { useSSO } from "@clerk/expo/experimental";
import { Link, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
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

type Mode = "auth" | "forgot-code" | "forgot-password" | "mfa";
type MfaMethod = "email_code" | "phone_code" | "totp" | "backup_code";
const GOOGLE_REDIRECT_URL = "okaab://sso-callback";
const MIN_PASSWORD_LENGTH = 15;

export default function SignInScreen() {
  const styles = useThemedStyles(createStyles);
  const { signIn, fetchStatus } = useSignIn();
  const { setActive } = useClerk();
  const { startSSOFlow } = useSSO();
  const { sso, resume } = useLocalSearchParams<{ sso?: string; resume?: string }>();
  const [mode, setMode] = useState<Mode>("auth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({});
  const [googleBusy, setGoogleBusy] = useState(false);
  const [mfaMethod, setMfaMethod] = useState<MfaMethod | null>(null);
  const busy = fetchStatus === "fetching";

  useEffect(() => {
    if (sso === "timeout") {
      setError("لم يكتمل تسجيل Google. اختر حسابك مرة أخرى وانتظر حتى يعود التطبيق تلقائيًا.");
    }
  }, [sso]);

  const clearFeedback = () => {
    setError("");
    setNotice("");
    setFieldErrors({});
  };

  const startMfa = async () => {
    clearFeedback();
    const strategies = signIn.supportedSecondFactors.map((factor) => factor.strategy);
    if (strategies.includes("email_code")) {
      const sent = await signIn.mfa.sendEmailCode();
      if (sent.error) throw sent.error;
      setMfaMethod("email_code");
      setNotice("أرسلنا رمز التحقق إلى بريدك.");
    } else if (strategies.includes("phone_code")) {
      const sent = await signIn.mfa.sendPhoneCode();
      if (sent.error) throw sent.error;
      setMfaMethod("phone_code");
      setNotice("أرسلنا رمز التحقق إلى هاتفك.");
    } else if (strategies.includes("totp")) {
      setMfaMethod("totp");
    } else if (strategies.includes("backup_code")) {
      setMfaMethod("backup_code");
    } else {
      throw new Error("لا توجد وسيلة تحقق إضافية متاحة لهذا الحساب.");
    }
    setCode("");
    setMode("mfa");
  };

  const verifyMfa = async () => {
    clearFeedback();
    if (!mfaMethod) return;
    const result = mfaMethod === "email_code"
      ? await signIn.mfa.verifyEmailCode({ code })
      : mfaMethod === "phone_code"
        ? await signIn.mfa.verifyPhoneCode({ code })
        : mfaMethod === "totp"
          ? await signIn.mfa.verifyTOTP({ code })
          : await signIn.mfa.verifyBackupCode({ code });
    if (result.error) {
      setFieldErrors({ code: authErrorMessage(result.error) });
      return;
    }
    if (signIn.status === "complete") await signIn.finalize({ navigate: navigateAfterAuthentication });
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
    if (!result.error && signIn.status === "complete") {
      await signIn.finalize({ navigate: navigateAfterAuthentication });
      return;
    }
    if (!result.error && (signIn.status === "needs_second_factor" || signIn.status === "needs_client_trust")) {
      try {
        await startMfa();
      } catch (value) {
        setError(authErrorMessage(value));
      }
      return;
    }
    if (result.error) {
      const fields = splitFieldErrors(result.error);
      setFieldErrors(fields);
      if (!fields.email && !fields.password) setError(authErrorMessage(result.error));
    }
  };

  useEffect(() => {
    if (resume !== "1") return;
    if (signIn.status !== "needs_second_factor" && signIn.status !== "needs_client_trust") return;
    void startMfa().catch((value) => setError(authErrorMessage(value)));
  // Clerk keeps the SSO attempt in its resource; this should run once when returning from the callback.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resume]);

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
    if (result.error) {
      const fields = splitFieldErrors(result.error);
      setFieldErrors({ password: fields.password });
      if (!fields.password) setError(authErrorMessage(result.error));
      return;
    }
    if (signIn.status === "complete") await signIn.finalize({ navigate: navigateAfterAuthentication });
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
        setError("عاد Google دون إنشاء جلسة دخول. أعد المحاولة، وإن استمرت المشكلة استخدم البريد الإلكتروني.");
      }
    } catch (value) {
      if (!isCancelledAuth(value)) setError(authErrorMessage(value));
    } finally {
      setGoogleBusy(false);
    }
  };

  const heading = mode === "auth"
    ? "مرحبًا بعودتك"
    : mode === "forgot-code"
      ? "تحقق من بريدك"
      : mode === "mfa"
        ? "تحقق من هويتك"
        : "أنشئ كلمة مرور جديدة";
  const description = mode === "auth"
    ? "سجّل الدخول وواصل مسارك من آخر نقطة وصلت إليها."
    : mode === "forgot-code"
      ? `أدخل الرمز المرسل إلى ${email}`
      : mode === "mfa"
        ? mfaMethod === "totp"
          ? "أدخل الرمز الظاهر في تطبيق المصادقة."
          : mfaMethod === "backup_code"
            ? "أدخل أحد رموز الاسترداد الخاصة بحسابك."
            : "أدخل رمز التحقق المرسل إلى وسيلة الأمان المسجّلة."
      : "اختر كلمة قوية، وسنفتح حسابك فورًا بعد الحفظ.";

  return (
    <View style={styles.screen}>
      <AuthScreen eyebrow="حساب واحد لكل تقدّمك" title={heading} description={description}>
        <View nativeID="clerk-captcha" />
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
        ) : mode === "mfa" ? (
          <>
            <Field
              label={mfaMethod === "backup_code" ? "رمز الاسترداد" : "رمز التحقق"}
              error={fieldErrors.code}
              autoComplete="one-time-code"
              inputMode={mfaMethod === "backup_code" ? "text" : "numeric"}
              maxLength={mfaMethod === "backup_code" ? 32 : 6}
              placeholder={mfaMethod === "backup_code" ? "اكتب رمز الاسترداد" : "000000"}
              value={code}
              onChangeText={(value) => { setCode(mfaMethod === "backup_code" ? value : value.replace(/\D/g, "")); setFieldErrors({}); }}
              style={styles.codeInput}
            />
            <Action
              title="تأكيد وفتح الحساب"
              onPress={() => void verifyMfa()}
              disabled={mfaMethod === "backup_code" ? !code.trim() : code.length !== 6}
              loading={busy}
            />
            {(mfaMethod === "email_code" || mfaMethod === "phone_code") ? (
              <TextButton title="إرسال رمز جديد" onPress={() => void startMfa().catch((value) => setError(authErrorMessage(value)))} disabled={busy} />
            ) : null}
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

const createStyles = (theme: AppTheme) => ({
  screen: { flex: 1 },
  linksRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  link: { minHeight: 44, justifyContent: "center", paddingHorizontal: 4 },
  linkText: { color: theme.colors.gold, fontFamily: theme.font.semibold, fontSize: 14, textAlign: "center" },
  codeInput: { textAlign: "center", fontSize: 22, letterSpacing: 8, writingDirection: "ltr" },
  hint: { color: theme.colors.muted, fontFamily: theme.font.regular, fontSize: 12, textAlign: "right", marginTop: -6 },
});
