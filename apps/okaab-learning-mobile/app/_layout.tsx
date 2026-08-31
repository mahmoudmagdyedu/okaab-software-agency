import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { I18nManager, Linking, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import {
  IBMPlexSansArabic_400Regular,
  IBMPlexSansArabic_500Medium,
  IBMPlexSansArabic_600SemiBold,
  IBMPlexSansArabic_700Bold,
  useFonts,
} from "@expo-google-fonts/ibm-plex-sans-arabic";

import { apiRequest } from "@/api";
import { Action, EagleLoader, Muted, Title } from "@/components";
import { theme } from "@/theme";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

I18nManager.allowRTL(true);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

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
  if (!config && !failed) return <EagleLoader label="نتحقق من جاهزية المنصة…" />;
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

function RootNavigator() {
  return (
    <View style={styles.navigator}>
      <Stack
        screenOptions={{
          headerTitleAlign: "center",
          headerBackTitle: "رجوع",
          contentStyle: { direction: "rtl", backgroundColor: theme.colors.paper },
          headerStyle: { backgroundColor: theme.colors.paper },
          headerTintColor: theme.colors.ink,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="sso-callback" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="session-task" options={{ headerShown: false, gestureEnabled: false }} />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    IBMPlexSansArabic_400Regular,
    IBMPlexSansArabic_500Medium,
    IBMPlexSansArabic_600SemiBold,
    IBMPlexSansArabic_700Bold,
  });

  if (!fontsLoaded) return <EagleLoader label={null} />;

  if (!publishableKey) {
    return (
      <SystemState
        title="التطبيق يحتاج إعدادًا صغيرًا"
        message="تعذّر تحميل إعدادات تسجيل الدخول. نحن نعمل على إصلاحها، ويمكنك المتابعة من الموقع مؤقتًا."
        action="فتح منصة عُقاب"
        onPress={() => void Linking.openURL("https://okaab.org/courses")}
      />
    );
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <SystemGate>
        <StatusBar style="dark" />
        <RootNavigator />
      </SystemGate>
    </ClerkProvider>
  );
}

const styles = StyleSheet.create({
  navigator: { flex: 1, backgroundColor: theme.colors.paper },
  system: {
    flex: 1,
    backgroundColor: theme.colors.paper,
    justifyContent: "center",
    padding: 24,
    gap: 16,
  },
  mark: { color: theme.colors.gold, fontSize: 36, fontWeight: "900", textAlign: "right" },
});
