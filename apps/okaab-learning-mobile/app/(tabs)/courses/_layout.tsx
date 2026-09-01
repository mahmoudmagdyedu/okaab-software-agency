import { Stack } from "expo-router";
import { useAppTheme } from "@/theme";

export default function CoursesLayout() {
  const theme = useAppTheme();
  return (
    <Stack
      screenOptions={{
        headerTitleAlign: "center",
        headerBackTitle: "رجوع",
        headerBackButtonDisplayMode: "minimal",
        contentStyle: { direction: "rtl", backgroundColor: theme.colors.paper },
        headerStyle: { backgroundColor: theme.colors.paper },
        headerTintColor: theme.colors.ink,
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
