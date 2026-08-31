import { useAuth } from "@clerk/expo";
import { Link } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View, RefreshControl } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { apiRequest, flushEvents } from "@/api";
import { Card, ErrorState, Loading, Muted, Screen, Title } from "@/components";
import { theme } from "@/theme";
import type { Announcement, Overview, PublicConfig } from "@/types";

export default function Home() {
  const { isLoaded, isSignedIn, getToken } = useAuth({ treatPendingAsSignedOut: false });
  const [overview, setOverview] = useState<Overview | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [config, setConfig] = useState<PublicConfig>({});
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setError("");
      const [nextOverview, nextAnnouncements, nextConfig] = await Promise.all([
        isSignedIn ? apiRequest<Overview>("/me/overview", getToken) : Promise.resolve(null),
        apiRequest<Announcement[]>("/announcements", isSignedIn ? getToken : undefined),
        apiRequest<PublicConfig>("/config"),
      ]);
      setOverview(nextOverview);
      setAnnouncements(nextAnnouncements);
      setConfig(nextConfig);
      if (isSignedIn) void flushEvents(getToken);
    } catch (value) {
      setError(value instanceof Error ? value.message : "تعذّر الاتصال");
    } finally {
      setRefreshing(false);
    }
  }, [getToken, isSignedIn]);

  useEffect(() => {
    if (isLoaded) void load();
  }, [isLoaded, load]);

  if (!isLoaded || (!overview && !error)) return <Loading />;
  if (error && !overview) {
    return (
      <Screen>
        <ErrorState message={error} retry={load} />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(); }} />}
      >
        <View style={styles.header}>
          <Animated.View entering={FadeInDown.duration(420).springify().damping(18)} style={styles.brand}>
            <View style={styles.brandTop}>
              <Image source={require("../../assets/okaab-icon-foreground.png")} style={styles.brandLogo} />
              <View style={styles.brandTitleWrap}>
                <Text style={styles.logo}>عُقاب</Text>
                <Text style={styles.tagline}>تعلّم بخطوات واضحة، وحلّق بمهاراتك.</Text>
              </View>
            </View>
            <Text style={styles.brandCopy}>مسارات عملية قصيرة تجمع الفيديو والتطبيق والاختبار في تجربة عربية واحدة.</Text>
            <View style={styles.brandBadge}><Text style={styles.brandBadgeText}>منصة تعلّم من فريق Okaab</Text></View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(80).duration(420)} style={styles.aboutGrid}>
            <View style={styles.aboutCard}>
              <Text style={styles.aboutNumber}>01</Text>
              <Text style={styles.aboutTitle}>تعلّم بالممارسة</Text>
              <Text style={styles.aboutText}>كل درس ينتهي بسؤال أو مهمة ونقاط حقيقية.</Text>
            </View>
            <View style={styles.aboutCard}>
              <Text style={styles.aboutNumber}>02</Text>
              <Text style={styles.aboutTitle}>مسار واضح</Text>
              <Text style={styles.aboutText}>لا تشتت: مرحلة تفتح المرحلة التالية تلقائيًا.</Text>
            </View>
          </Animated.View>

          {announcements.slice(0, 2).map((item) => (
            <View key={item.id} accessibilityRole="summary" style={styles.announcement}>
              <Text style={styles.announcementTitle}>{item.title}</Text>
              <Text style={styles.announcementBody}>{item.body}</Text>
            </View>
          ))}

          {overview ? (
            <Card>
              <Title>أهلًا {overview.profile.display_name.split(" ")[0]}</Title>
              <View style={styles.metrics}>
                <Text style={styles.metric}>{overview.points} نقطة</Text>
                {config.features?.streaks !== false && (
                  <Text style={styles.metric}>{overview.streak.current_days} يوم متواصل</Text>
                )}
              </View>
              {overview.continueLearning && (
                <Link
                  href={{
                    pathname: "/(tabs)/courses/lesson/[slug]",
                    params: { slug: overview.continueLearning.slug },
                  }}
                  asChild
                >
                  <Pressable style={styles.continue}>
                    <Text style={styles.continueText}>
                      كمّل: {overview.continueLearning.title}
                    </Text>
                  </Pressable>
                </Link>
              )}
            </Card>
          ) : (
            <Link href="/(auth)/sign-in" asChild>
              <Pressable style={styles.signIn}>
                <Text style={styles.signInText}>سجّل دخولك واحفظ تقدّمك</Text>
              </Pressable>
            </Link>
          )}

          <View style={styles.nav}>
            <Link href="/(tabs)/courses" asChild>
              <Pressable style={styles.explore}>
                <Text style={styles.exploreText}>استكشف مسارات التعلّم</Text>
              </Pressable>
            </Link>
            <Link href="/(tabs)/about" style={styles.navLink}>
              مين عُقاب؟
            </Link>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: 118, gap: 12 },
  header: { gap: 16, marginBottom: 8 },
  brand: { backgroundColor: theme.colors.darkPaper || "#181511", borderRadius: 28, padding: 20, gap: 12, borderWidth: 1, borderColor: `${theme.colors.gold}44`, overflow: "hidden" },
  brandTop: { flexDirection: "row-reverse", alignItems: "center", gap: 14 },
  brandLogo: { width: 70, height: 70, resizeMode: "contain" },
  brandTitleWrap: { flex: 1, alignItems: "flex-end", gap: 2 },
  logo: { color: theme.colors.gold || "#E8A33D", fontSize: 30, fontWeight: "900", textAlign: "right" },
  tagline: { color: theme.colors.darkInk || "#F6F1E7", opacity: 0.88, textAlign: "right", fontWeight: "800", lineHeight: 21 },
  brandCopy: { color: theme.colors.darkInk, opacity: 0.68, textAlign: "right", lineHeight: 22 },
  brandBadge: { alignSelf: "flex-end", backgroundColor: `${theme.colors.gold}1F`, borderRadius: 99, paddingHorizontal: 11, paddingVertical: 7 },
  brandBadgeText: { color: theme.colors.gold, fontSize: 11, fontWeight: "900" },
  aboutGrid: { flexDirection: "row-reverse", gap: 10 },
  aboutCard: { flex: 1, minHeight: 138, backgroundColor: theme.colors.card, borderRadius: 18, borderWidth: 1, borderColor: `${theme.colors.ink}20`, padding: 13, gap: 5 },
  aboutNumber: { color: theme.colors.gold, fontWeight: "900", fontSize: 18, textAlign: "right" },
  aboutTitle: { color: theme.colors.ink, fontWeight: "900", textAlign: "right" },
  aboutText: { color: theme.colors.ink, opacity: 0.62, textAlign: "right", fontSize: 12, lineHeight: 18 },
  announcement: {
    borderWidth: 1,
    borderColor: theme.colors.gold || "#E8A33D",
    borderRadius: 10,
    backgroundColor: theme.colors.card || "#FFFFFF",
    padding: 14,
    gap: 5,
  },
  announcementTitle: { color: theme.colors.ink || "#181511", textAlign: "right", fontWeight: "900" },
  announcementBody: { color: theme.colors.ink || "#181511", textAlign: "right", opacity: 0.72, lineHeight: 21 },
  metrics: { flexDirection: "row-reverse", gap: 8 },
  metric: {
    backgroundColor: theme.colors.paperAlt || "#FAFAFA",
    borderRadius: 6,
    padding: 8,
    color: theme.colors.ink || "#181511",
  },
  continue: {
    backgroundColor: theme.colors.gold || "#E8A33D",
    minHeight: 44,
    borderRadius: 10,
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  continueText: { color: theme.colors.ink || "#181511", fontWeight: "700", textAlign: "right" },
  signIn: {
    minHeight: 48,
    borderColor: theme.colors.gold || "#E8A33D",
    borderWidth: 1,
    borderRadius: 10,
    justifyContent: "center",
  },
  signInText: { color: theme.colors.ink || "#181511", textAlign: "center", fontWeight: "700" },
  nav: { gap: 10, marginTop: 8 },
  explore: { minHeight: 50, backgroundColor: theme.colors.gold, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  exploreText: { color: theme.colors.ink, fontWeight: "900", fontSize: 15 },
  navLink: { color: theme.colors.gold || "#E8A33D", fontWeight: "700" },
});
