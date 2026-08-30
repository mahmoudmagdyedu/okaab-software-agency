import { Tabs } from "expo-router";
import { Text } from "react-native";
import { theme } from "@/theme";

function TabIcon({ label, active }: { label: string; active: boolean }) {
  return (
    <Text
      style={{
        color: active ? theme.colors.gold : `${theme.colors.ink}88`,
        fontSize: 18,
        fontWeight: "900",
      }}
    >
      {label}
    </Text>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.gold || "#E8A33D",
        tabBarInactiveTintColor: theme.colors.ink ? `${theme.colors.ink}88` : "#18151188",
        tabBarStyle: {
          backgroundColor: theme.colors.paper || "#F6F1E7",
          borderTopColor: `${theme.colors.ink || "#181511"}22`,
          borderTopWidth: 1,
          height: 70,
          paddingTop: 7,
          paddingBottom: 8,
          elevation: 12,
        },
        tabBarLabelStyle: { fontWeight: "800", fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "الرئيسية",
          tabBarLabel: "الرئيسية",
          tabBarIcon: ({ focused }) => <TabIcon label="⌂" active={focused} />,
        }}
      />
      <Tabs.Screen
        name="courses"
        options={{
          title: "الدورات",
          tabBarLabel: "الدورات",
          tabBarIcon: ({ focused }) => <TabIcon label="◇" active={focused} />,
        }}
      />
      <Tabs.Screen
        name="achievements"
        options={{
          title: "الإنجازات",
          tabBarLabel: "الإنجازات",
          tabBarIcon: ({ focused }) => <TabIcon label="★" active={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "الحساب",
          tabBarLabel: "الحساب",
          tabBarIcon: ({ focused }) => <TabIcon label="○" active={focused} />,
        }}
      />
      <Tabs.Screen name="about" options={{ href: null }} />
    </Tabs>
  );
}
