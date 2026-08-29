import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { Stack } from "expo-router";
import { I18nManager } from "react-native";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
if (!publishableKey) throw new Error("أضف EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY إلى ملف .env");

I18nManager.allowRTL(true);

export default function RootLayout() {
  return <ClerkProvider publishableKey={publishableKey!} tokenCache={tokenCache}><Stack screenOptions={{ headerTitleAlign: "center", headerBackTitle: "رجوع", contentStyle: { direction: "rtl" } }}><Stack.Screen name="index" options={{ headerShown: false }} /><Stack.Screen name="sign-in" options={{ title: "الدخول إلى عُقاب" }} /><Stack.Screen name="course/[slug]" options={{ title: "الكورس" }} /><Stack.Screen name="lesson/[slug]" options={{ title: "الدرس" }} /><Stack.Screen name="leaderboard" options={{ title: "لوحة المتصدرين" }} /><Stack.Screen name="profile" options={{ title: "حسابي" }} /></Stack></ClerkProvider>;
}
