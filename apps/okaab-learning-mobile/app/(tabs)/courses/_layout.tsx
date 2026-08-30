import { Stack } from "expo-router";
import { theme } from "@/theme";

export default function CoursesLayout() {
  return (
    <Stack
      screenOptions={{
        headerTitleAlign: "center",
        headerBackTitle: "رجوع",
        contentStyle: { direction: "rtl", backgroundColor: theme.colors.paper || "#F6F1E7" },
        headerStyle: { backgroundColor: theme.colors.paper || "#F6F1E7" },
        headerTintColor: theme.colors.ink || "#181511",
      }}
    >
      <Stack.Screen name="index" options={{ title: "الدورات" }} />
      <Stack.Screen name="course/[slug]" options={{ title: "الكورس" }} />
      <Stack.Screen name="lesson/[slug]" options={{ title: "الدرس" }} />
      <Stack.Screen name="quiz/[slug]" options={{ title: "اختبار الدرس" }} />
      <Stack.Screen name="task/[slug]" options={{ title: "المهمة العملية" }} />
    </Stack>
  );
}
