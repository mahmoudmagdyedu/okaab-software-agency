import { useAuth, useSessionList } from "@clerk/expo";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { authErrorMessage } from "@/auth-errors";
import { navigateAfterAuthentication } from "@/auth-session";
import { Action, EagleLoader, Muted, Title } from "@/components";
import { type AppTheme, useAppTheme, useThemedStyles } from "@/theme";

const MIN_PASSWORD_LENGTH = 15;

export default function SessionTaskScreen() {
  const theme = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const { sessionId } = useAuth({ treatPendingAsSignedOut: false });
  const sessionList = useSessionList();
  const pendingSession = useMemo(
    () => sessionList.isLoaded
      ? sessionList.sessions.find((session) => session.id === sessionId && session.status === "pending")
        || sessionList.sessions.find((session) => session.status === "pending")
      : undefined,
    [sessionId, sessionList],
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [totpSecret, setTotpSecret] = useState("");
  const [totpCode, setTotpCode] = useState("");

  useEffect(() => {
    if (!sessionList.isLoaded) return;
    const activeSession = sessionList.sessions.find((session) => session.status === "active");
    if (!pendingSession && activeSession) router.replace("/(tabs)");
    if (!pendingSession && !activeSession) router.replace("/(auth)/sign-in");
  }, [pendingSession, sessionList]);

  if (!sessionList.isLoaded || !pendingSession) {
    return <EagleLoader label="نراجع آخر خطوة في حسابك…" />;
  }

  const task = pendingSession.currentTask?.key;
  const memberships = pendingSession.user?.organizationMemberships || [];

  const refreshAndContinue = async () => {
    await pendingSession.reload();
    await sessionList.setActive({ session: pendingSession.id, navigate: navigateAfterAuthentication });
  };

  const chooseOrganization = async (organizationId: string) => {
    setError("");
    setBusy(true);
    try {
      await sessionList.setActive({
        session: pendingSession.id,
        organization: organizationId,
        navigate: navigateAfterAuthentication,
      });
    } catch (value) {
      setError(authErrorMessage(value));
    } finally {
      setBusy(false);
    }
  };

  const updatePassword = async () => {
    setError("");
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`يجب أن تتكون كلمة المرور من ${MIN_PASSWORD_LENGTH} حرفًا على الأقل.`);
      return;
    }
    if (password !== confirmPassword) {
      setError("كلمتا المرور غير متطابقتين.");
      return;
    }
    setBusy(true);
    try {
      await pendingSession.user?.updatePassword({ newPassword: password, signOutOfOtherSessions: false });
      await refreshAndContinue();
    } catch (value) {
      setError(authErrorMessage(value));
    } finally {
      setBusy(false);
    }
  };

  const prepareTotp = async () => {
    setError("");
    setBusy(true);
    try {
      const totp = await pendingSession.user?.createTOTP();
      if (!totp?.secret) throw new Error("تعذّر إنشاء مفتاح التحقق.");
      setTotpSecret(totp.secret);
    } catch (value) {
      setError(authErrorMessage(value));
    } finally {
      setBusy(false);
    }
  };

  const verifyTotp = async () => {
    setError("");
    setBusy(true);
    try {
      await pendingSession.user?.verifyTOTP({ code: totpCode });
      await refreshAndContinue();
    } catch (value) {
      setError(authErrorMessage(value));
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.brandRow}>
          <Text style={styles.brand}>عُقاب</Text>
          <View style={styles.step}><Text style={styles.stepText}>خطوة حماية أخيرة</Text></View>
        </View>
        <View style={styles.card}>
          {task === "choose-organization" ? (
            <>
              <Title>اختر مساحة العمل</Title>
              <Muted>حسابك جاهز. اختر الفريق الذي تريد المتابعة داخله.</Muted>
              <View style={styles.list}>
                {memberships.map((membership) => (
                  <Pressable
                    key={membership.id}
                    disabled={busy}
                    onPress={() => void chooseOrganization(membership.organization.id)}
                    style={({ pressed }) => [styles.organization, pressed && styles.pressed]}
                  >
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{membership.organization.name.slice(0, 1)}</Text>
                    </View>
                    <View style={styles.organizationText}>
                      <Text style={styles.organizationName}>{membership.organization.name}</Text>
                      <Text style={styles.organizationRole}>{membership.roleName || membership.role}</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
              {!memberships.length ? (
                <Text style={styles.error}>لا توجد مساحة عمل مرتبطة بالحساب. تواصل مع إدارة عُقاب لإكمال الدعوة.</Text>
              ) : null}
            </>
          ) : task === "reset-password" ? (
            <>
              <Title>حدّث كلمة المرور</Title>
              <Muted>طلبت سياسة الأمان تعيين كلمة مرور جديدة قبل فتح حسابك.</Muted>
              <Text style={styles.label}>كلمة المرور الجديدة</Text>
              <TextInput
                autoComplete="new-password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                placeholder="15 حرفًا على الأقل"
                placeholderTextColor="#857C70"
                style={styles.input}
              />
              <Text style={styles.label}>تأكيد كلمة المرور</Text>
              <TextInput
                autoComplete="new-password"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="أعد كتابة كلمة المرور"
                placeholderTextColor="#857C70"
                style={styles.input}
              />
              <Action title="حفظ والمتابعة" loading={busy} onPress={() => void updatePassword()} />
            </>
          ) : task === "setup-mfa" ? (
            <>
              <Title>فعّل التحقق بخطوتين</Title>
              <Muted>اربط تطبيق المصادقة لحماية حسابك، ثم أدخل الرمز المؤقت.</Muted>
              {!totpSecret ? (
                <Action title="إنشاء مفتاح المصادقة" loading={busy} onPress={() => void prepareTotp()} />
              ) : (
                <>
                  <Text style={styles.label}>المفتاح اليدوي داخل تطبيق المصادقة</Text>
                  <Text selectable style={styles.secret}>{totpSecret}</Text>
                  <Text style={styles.label}>الرمز المكوّن من 6 أرقام</Text>
                  <TextInput
                    autoComplete="one-time-code"
                    inputMode="numeric"
                    maxLength={6}
                    value={totpCode}
                    onChangeText={(value) => setTotpCode(value.replace(/\D/g, ""))}
                    placeholder="000000"
                    placeholderTextColor="#857C70"
                    style={[styles.input, styles.codeInput]}
                  />
                  <Action title="تأكيد وفتح الحساب" disabled={totpCode.length !== 6} loading={busy} onPress={() => void verifyTotp()} />
                </>
              )}
            </>
          ) : (
            <>
              <Title>نُكمل إعداد حسابك</Title>
              <Muted>هناك خطوة أمان مطلوبة من Clerk. أعد فتح تسجيل الدخول، وإن استمرت الرسالة تواصل مع الدعم.</Muted>
              <Action title="العودة لتسجيل الدخول" onPress={() => router.replace("/(auth)/sign-in")} />
            </>
          )}
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: AppTheme) => ({
  safe: { flex: 1, backgroundColor: theme.colors.paper },
  content: { flexGrow: 1, justifyContent: "center", padding: 22, gap: 18 },
  brandRow: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between" },
  brand: { color: theme.colors.gold, fontFamily: theme.font.bold, fontSize: 32 },
  step: { backgroundColor: "rgba(232,163,61,.14)", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  stepText: { color: "#8A5200", fontFamily: theme.font.semibold, fontSize: 12 },
  card: { backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 28, padding: 22, gap: 14 },
  list: { gap: 10 },
  organization: { minHeight: 68, borderWidth: 1, borderColor: "rgba(24,21,17,.14)", borderRadius: 18, padding: 12, flexDirection: "row-reverse", alignItems: "center", gap: 12 },
  organizationText: { flex: 1 },
  organizationName: { color: theme.colors.ink, fontFamily: theme.font.semibold, fontSize: 16, textAlign: "right" },
  organizationRole: { color: theme.colors.muted, fontFamily: theme.font.regular, fontSize: 12, textAlign: "right" },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: theme.colors.gold, alignItems: "center", justifyContent: "center" },
  avatarText: { color: theme.colors.ink, fontFamily: theme.font.bold, fontSize: 17 },
  label: { color: theme.colors.ink, fontFamily: theme.font.semibold, fontSize: 14, textAlign: "right" },
  input: { minHeight: 52, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 16, paddingHorizontal: 14, color: theme.colors.ink, backgroundColor: theme.colors.input, fontFamily: theme.font.regular, textAlign: "right" },
  codeInput: { textAlign: "center", fontSize: 20, letterSpacing: 7, writingDirection: "ltr" },
  secret: { borderRadius: 14, padding: 13, backgroundColor: "#181511", color: "#F6F1E7", fontSize: 14, letterSpacing: 1.2, textAlign: "center", writingDirection: "ltr" },
  error: { color: "#B3261E", fontFamily: theme.font.medium, fontSize: 13, lineHeight: 21, textAlign: "right" },
  pressed: { opacity: 0.72 },
});
