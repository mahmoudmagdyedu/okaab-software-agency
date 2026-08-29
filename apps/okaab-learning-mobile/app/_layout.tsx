import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { I18nManager, Linking, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";

import { apiRequest } from "@/api";
import { Action, Loading, Muted, Title } from "@/components";
import { theme } from "@/theme";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
if (!publishableKey) throw new Error("أضف EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY إلى ملف .env");

I18nManager.allowRTL(true);

type MobileConfig = {
  mobile?: {
    maintenance_mode?: boolean;
    force_update?: boolean;
    min_app_version?: string;
    maintenance_message?: string;
    update_message?: string;
    update_url?: string;
  };
};

function SystemGate({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<MobileConfig | null>(null);
  const [failed, setFailed] = useState(false);
  const load = async () => {
    setFailed(false);
    try {
      setConfig(await apiRequest<MobileConfig>("/config"));
    } catch {
      setFailed(true);
    }
  };
  useEffect(() => {
    void load();
  }, []);
  if (!config && !failed) return <Loading />;
  if (config?.mobile?.maintenance_mode)
    return (
      <SystemState
        title="بنطوّر المنصة دلوقتي"
        message={
          config.mobile.maintenance_message ||
          "خدمة التعلّم في صيانة قصيرة. ارجع بعد شوية وهتلاقي كل تقدّمك محفوظ."
        }
        action="إعادة المحاولة"
        onPress={() => void load()}
      />
    );
  if (config?.mobile?.force_update)
    return (
      <SystemState
        title="في تحديث مهم لعُقاب"
        message={
          config.mobile.update_message ||
          `نزّل أحدث نسخة عشان تكمّل دروسك بأمان. الحد الأدنى المطلوب ${config.mobile.min_app_version || "هو آخر إصدار"}.`
        }
        action="تحديث التطبيق"
        onPress={() =>
          void Linking.openURL(config.mobile?.update_url || "https://okaab.org/courses")
        }
      />
    );
  return <>{children}</>;
}

function SystemState({
  title,
  message,
  action,
  onPress,
}: {
  title: string;
  message: string;
  action: string;
  onPress: () => void;
}) {
  return (
    <View style={styles.system}>
      <Text style={styles.mark}>عُقاب</Text>
      <Title>{title}</Title>
      <Muted>{message}</Muted>
      <Action title={action} onPress={onPress} />
    </View>
  );
}

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey!} tokenCache={tokenCache}>
      <SystemGate>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerTitleAlign: "center",
            headerBackTitle: "رجوع",
            contentStyle: { direction: "rtl", backgroundColor: theme.colors.paper },
            headerStyle: { backgroundColor: theme.colors.paper },
            headerTintColor: theme.colors.ink,
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
          <Stack.Screen name="sign-in" options={{ title: "الدخول إلى عُقاب" }} />
          <Stack.Screen name="course/[slug]" options={{ title: "الكورس" }} />
          <Stack.Screen name="lesson/[slug]" options={{ title: "الدرس" }} />
          <Stack.Screen name="quiz/[slug]" options={{ title: "اختبار الدرس" }} />
          <Stack.Screen name="task/[slug]" options={{ title: "المهمة العملية" }} />
          <Stack.Screen name="leaderboard" options={{ title: "لوحة المتصدرين" }} />
          <Stack.Screen name="profile" options={{ title: "حسابي" }} />
          <Stack.Screen name="about" options={{ title: "مين عُقاب؟" }} />
        </Stack>
      </SystemGate>
    </ClerkProvider>
  );
}

const styles = StyleSheet.create({
  system: {
    flex: 1,
    backgroundColor: theme.colors.paper,
    justifyContent: "center",
    padding: 24,
    gap: 16,
  },
  mark: { color: theme.colors.gold, fontSize: 36, fontWeight: "900", textAlign: "right" },
});
