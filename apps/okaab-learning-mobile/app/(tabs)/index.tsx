import { useAuth } from "@clerk/expo";
import { Link } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View, RefreshControl } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { apiRequest, flushEvents } from "@/api";
import { Card, ErrorState, Loading, Muted, Screen, Title } from "@/components";
import { type AppTheme, useThemedStyles } from "@/theme";
import type { Announcement, Overview, PublicConfig } from "@/types";

export default function Home() {
  const styles = useThemedStyles(createStyles);
  const { isLoaded, isSignedIn, getToken } = useAuth();
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
          <Animated.View entering={FadeIn.duration(240)} style={styles.brand}>
            <View style={styles.brandTop}>
              <Image accessibilityLabel="شعار عُقاب" source={require("../../assets/okaab-brand-logo-transparent.png")} style={styles.brandLogo} />
              <View style={styles.brandTitleWrap}>
                <Text style={styles.logo}>عُقاب</Text>
                <Text style={styles.tagline}>تعلّم بخطوات واضحة، وحلّق بمهاراتك.</Text>
              </View>
            </View>
            <Text style={styles.brandCopy}>مسارات عملية قصيرة تجمع الفيديو والتطبيق والاختبار في تجربة عربية واحدة.</Text>
            <View style={styles.brandBadge}><Text style={styles.brandBadgeText}>منصة تعلّم من فريق Okaab</Text></View>
          </Animated.View>

          <Animated.View entering={FadeIn.delay(70).duration(220)} style={styles.aboutGrid}>
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
                <View style={styles.metric}>
                  <Text style={styles.metricValue}>{overview.points}</Text>
                  <Text style={styles.metricLabel}>نقطة</Text>
                </View>
                {config.features?.streaks !== false && (
                  <View style={styles.metric}>
                    <Text style={styles.metricValue}>{overview.streak.current_days}</Text>
                    <Text style={styles.metricLabel}>يوم متواصل</Text>
                  </View>
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

const createStyles = (theme: AppTheme) => ({
  list: { paddingBottom: 118, gap: 12 },
  header: { gap: 16, marginBottom: 8 },
  brand: { backgroundColor: theme.colors.darkPaper || "#181511", borderRadius: 28, paddingHorizontal: 20, paddingVertical: 22, gap: 12, borderWidth: 1, borderColor: `${theme.colors.gold}44`, overflow: "hidden", alignItems: "center" },
  brandTop: { alignItems: "center", justifyContent: "center", gap: 4 },
  brandLogo: { width: 150, height: 108, resizeMode: "contain" },
  brandTitleWrap: { alignItems: "center", gap: 3 },
  logo: { color: theme.colors.gold || "#E8A33D", fontSize: 32, fontWeight: "900", textAlign: "center" },
  tagline: { color: theme.colors.darkInk || "#F6F1E7", opacity: 0.9, textAlign: "center", fontWeight: "800", lineHeight: 22 },
  brandCopy: { color: theme.colors.darkInk, opacity: 0.7, textAlign: "center", lineHeight: 22 },
  brandBadge: { alignSelf: "center", backgroundColor: `${theme.colors.gold}1F`, borderRadius: 99, paddingHorizontal: 11, paddingVertical: 7 },
  brandBadgeText: { color: theme.colors.gold, fontSize: 11, fontWeight: "900" },
  aboutGrid: { flexDirection: "row-reverse", gap: 10 },
  aboutCard: { flex: 1, minHeight: 138, backgroundColor: theme.colors.card, borderRadius: 18, borderWidth: 1, borderColor: theme.colors.border, padding: 13, gap: 5 },
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
  metrics: { flexDirection: "row-reverse", gap: 10, flexWrap: "wrap" },
  metric: {
    minWidth: 112,
    flexDirection: "row-reverse",
    alignItems: "baseline",
    justifyContent: "center",
    gap: 6,
    backgroundColor: theme.colors.paperAlt || "#FAFAFA",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  metricValue: { color: theme.colors.ink, fontSize: 19, fontWeight: "900" },
  metricLabel: { color: theme.colors.ink, opacity: 0.62, fontSize: 12, fontWeight: "700" },
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
