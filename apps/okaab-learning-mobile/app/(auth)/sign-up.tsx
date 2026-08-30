import { useSignUp, useSSO } from "@clerk/expo";
import { Link, router } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Action, Muted, Title } from "@/components";
import { theme } from "@/theme";

function message(value: unknown) {
  const error = value as { errors?: { message?: string; longMessage?: string }[] };
  return error?.errors?.[0]?.longMessage || error?.errors?.[0]?.message || "راجع البيانات وحاول مرة أخرى";
}

export default function SignUpScreen() {
  const { signUp, fetchStatus } = useSignUp();
  const { startSSOFlow } = useSSO();
  const [verify, setVerify] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const insets = useSafeAreaInsets();
  const busy = fetchStatus === "fetching";
  const done = () => router.replace("/(tabs)");

  const submit = async () => {
    setError("");
    const result = await signUp.password({ emailAddress: email.trim(), password });
    if (result.error) {
      setError(message(result.error));
      return;
    }
    const sent = await signUp.verifications.sendEmailCode();
    if (sent.error) {
      setError(message(sent.error));
      return;
    }
    setCode("");
    setVerify(true);
  };

  const confirm = async () => {
    setError("");
    const result = await signUp.verifications.verifyEmailCode({ code });
    if (result.error) {
      setError(message(result.error));
      return;
    }
    if (signUp.status === "complete") await signUp.finalize({ navigate: done });
  };

  const google = async () => {
    setError("");
    try {
      const { createdSessionId, setActive } = await startSSOFlow({ strategy: "oauth_google" });
      if (createdSessionId) {
        await setActive?.({ session: createdSessionId });
        done();
      }
    } catch (value) {
      setError(message(value));
    }
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.page, { paddingTop: Math.max(insets.top, 28), paddingBottom: Math.max(insets.bottom, 28) }]}
      >
        <View style={styles.form} nativeID="clerk-captcha">
          <Text style={styles.brand}>عُقاب</Text>
          <Title>{verify ? "أكد بريدك" : "ابدأ رحلة التعلّم"}</Title>
          <Muted>{verify ? `أرسلنا رمزًا إلى ${email}` : "أنشئ حسابًا واحدًا يحفظ نقاطك وتقدمك على الموقع والتطبيق."}</Muted>
          {!verify ? (
            <>
              <Text style={styles.label}>البريد الإلكتروني</Text>
              <TextInput accessibilityLabel="البريد الإلكتروني" autoCapitalize="none" autoComplete="email" inputMode="email" placeholder="name@example.com" placeholderTextColor="#71695F" value={email} onChangeText={setEmail} style={styles.input} />
              <Text style={styles.label}>كلمة المرور</Text>
              <TextInput accessibilityLabel="كلمة المرور" autoComplete="new-password" secureTextEntry placeholder="8 أحرف أو أكثر" placeholderTextColor="#71695F" value={password} onChangeText={setPassword} style={styles.input} />
              <Action title="إنشاء الحساب" onPress={() => void submit()} disabled={!email.trim() || password.length < 8} loading={busy} />
              <View style={styles.divider}><View style={styles.line} /><Text style={styles.or}>أو</Text><View style={styles.line} /></View>
              <Pressable disabled={busy} onPress={() => void google()} style={styles.google}>
                <Text style={styles.googleG}>G</Text><Text style={styles.googleText}>إنشاء الحساب عبر Google</Text>
              </Pressable>
              <Link href="/(auth)/sign-in" asChild><Pressable style={styles.switch}><Text style={styles.switchText}>لديك حساب؟ سجّل الدخول</Text></Pressable></Link>
            </>
          ) : (
            <>
              <Text style={styles.label}>رمز التحقق</Text>
              <TextInput accessibilityLabel="رمز التحقق" autoComplete="one-time-code" inputMode="numeric" maxLength={6} placeholder="000000" value={code} onChangeText={setCode} style={[styles.input, styles.code]} />
              <Action title="تأكيد البريد والدخول" onPress={() => void confirm()} disabled={code.length < 6} loading={busy} />
              <Pressable onPress={() => setVerify(false)}><Text style={styles.switchText}>تغيير البريد</Text></Pressable>
            </>
          )}
          {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  page: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 18 },
  form: { gap: 12, backgroundColor: "#F6F1E7E8", borderWidth: 1.5, borderColor: theme.colors.ink, borderRadius: 28, padding: 20, shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  brand: { color: theme.colors.gold, fontSize: 34, fontWeight: "900", textAlign: "right" },
  label: { color: theme.colors.ink, textAlign: "right", fontWeight: "900", marginTop: 3 },
  input: { minHeight: 52, borderWidth: 1.5, borderColor: `${theme.colors.ink}66`, borderRadius: 14, paddingHorizontal: 14, color: theme.colors.ink, textAlign: "right", backgroundColor: "#FFFDF8D9" },
  code: { textAlign: "center", fontSize: 22, letterSpacing: 8, writingDirection: "ltr" },
  divider: { flexDirection: "row", alignItems: "center", gap: 10 },
  line: { height: 1, flex: 1, backgroundColor: `${theme.colors.ink}32` },
  or: { color: theme.colors.ink, opacity: 0.65 },
  google: { minHeight: 50, flexDirection: "row-reverse", gap: 10, borderWidth: 1.5, borderColor: theme.colors.ink, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFFC9" },
  googleG: { color: "#4285F4", fontSize: 18, fontWeight: "900" },
  googleText: { color: theme.colors.ink, fontWeight: "900" },
  switch: { minHeight: 44, justifyContent: "center" },
  switchText: { color: "#A76500", fontWeight: "900", textAlign: "center", padding: 8 },
  error: { color: theme.colors.error, backgroundColor: "#FFF4F2", borderWidth: 1, borderColor: theme.colors.error, borderRadius: 12, padding: 12, textAlign: "right", lineHeight: 21 },
});
