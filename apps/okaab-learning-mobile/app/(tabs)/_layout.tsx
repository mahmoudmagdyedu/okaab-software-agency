import { useAuth } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import type { ComponentProps } from "react";
import { StyleSheet, View } from "react-native";
import { EagleLoader } from "@/components";
import { type AppTheme, useAppTheme, useThemedStyles } from "@/theme";

function TabIcon({
  active,
  activeName,
  inactiveName,
}: {
  active: boolean;
  activeName: ComponentProps<typeof Ionicons>["name"];
  inactiveName: ComponentProps<typeof Ionicons>["name"];
}) {
  const theme = useAppTheme();
  const styles = useThemedStyles(createStyles);
  return (
    <View style={[styles.icon, active && styles.activeIcon]}>
      <Ionicons
        name={active ? activeName : inactiveName}
        color={active ? theme.colors.ink : "rgba(246,241,231,0.66)"}
        size={20}
      />
    </View>
  );
}

export default function TabsLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const theme = useAppTheme();

  if (!isLoaded) return <EagleLoader label="نجهّز مساحتك التعليمية…" />;
  if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.gold || "#E8A33D",
        sceneStyle: { backgroundColor: theme.colors.paper, direction: "rtl" },
        tabBarInactiveTintColor: "rgba(246,241,231,0.62)",
        tabBarStyle: {
          position: "absolute",
          left: 12,
          right: 12,
          bottom: 10,
          backgroundColor: theme.colors.navigation,
          borderTopColor: theme.colors.border,
          borderTopWidth: 0,
          height: 68,
          paddingTop: 8,
          paddingBottom: 8,
          borderRadius: 22,
          elevation: 12,
        },
        tabBarLabelStyle: { fontWeight: "900", fontSize: 10 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "الرئيسية",
          tabBarLabel: "الرئيسية",
          tabBarIcon: ({ focused }) => <TabIcon active={focused} activeName="home" inactiveName="home-outline" />,
        }}
      />
      <Tabs.Screen
        name="courses"
        options={{
          title: "الدورات",
          tabBarLabel: "الدورات",
          tabBarIcon: ({ focused }) => <TabIcon active={focused} activeName="map" inactiveName="map-outline" />,
        }}
      />
      <Tabs.Screen
        name="achievements"
        options={{
          title: "الإنجازات",
          tabBarLabel: "الإنجازات",
          tabBarIcon: ({ focused }) => <TabIcon active={focused} activeName="trophy" inactiveName="trophy-outline" />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "الحساب",
          tabBarLabel: "الحساب",
          tabBarIcon: ({ focused }) => <TabIcon active={focused} activeName="person" inactiveName="person-outline" />,
        }}
      />
      <Tabs.Screen name="about" options={{ href: null }} />
    </Tabs>
  );
}

const createStyles = (theme: AppTheme) => ({
  icon: { width: 34, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  activeIcon: { backgroundColor: theme.colors.gold },
});
