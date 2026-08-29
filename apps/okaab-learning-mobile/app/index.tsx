import { useAuth } from "@clerk/expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, Redirect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";

import { apiRequest, flushEvents } from "@/api";
import { Card, ErrorState, Loading, Muted, Screen, Title } from "@/components";
import { theme } from "@/theme";
import type { Announcement, Catalog, Course, Overview, PublicConfig } from "@/types";

export default function Home() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [config, setConfig] = useState<PublicConfig>({});
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [onboardingSeen, setOnboardingSeen] = useState<boolean | null>(null);
  useEffect(() => {
    void AsyncStorage.getItem("okaab-onboarding-v1").then((value) =>
      setOnboardingSeen(value === "seen"),
    );
  }, []);
  const load = useCallback(async () => {
    try {
      setError("");
      const [nextCatalog, nextOverview, nextAnnouncements, nextConfig] = await Promise.all([
        apiRequest<Catalog>("/catalog", isSignedIn ? getToken : undefined),
        isSignedIn ? apiRequest<Overview>("/me/overview", getToken) : Promise.resolve(null),
        apiRequest<Announcement[]>("/announcements", isSignedIn ? getToken : undefined),
        apiRequest<PublicConfig>("/config"),
      ]);
      setCatalog(nextCatalog);
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
  if (onboardingSeen === false) return <Redirect href="/onboarding" />;
  if (onboardingSeen === null || !isLoaded || (!catalog && !error)) return <Loading />;
  if (error && !catalog)
    return (
      <Screen>
        <ErrorState message={error} retry={load} />
      </Screen>
    );
  const progressByLesson = new Map(catalog!.progress.map((item) => [item.lesson_id, item]));
  const completion = (course: Course) => {
    const lessons = catalog!.lessons.filter((lesson) => lesson.course_id === course.id);
    if (!lessons.length) return 0;
    return Math.round(
      (lessons.filter((lesson) => progressByLesson.get(lesson.id)?.status === "completed").length /
        lessons.length) *
        100,
    );
  };
  return (
    <Screen>
      <FlatList
        data={catalog!.courses}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              void load();
            }}
          />
        }
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.brand}>
              <Text style={styles.logo}>عُقاب</Text>
              <Text style={styles.tagline}>تعلّم بخطوات واضحة</Text>
            </View>
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
                      pathname: "/lesson/[slug]",
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
              <Link href="/sign-in" asChild>
                <Pressable style={styles.signIn}>
                  <Text style={styles.signInText}>سجّل دخولك واحفظ تقدّمك</Text>
                </Pressable>
              </Link>
            )}
            <View style={styles.nav}>
              {config.features?.leaderboard !== false && (
                <Link href="/leaderboard" style={styles.navLink}>
                  المتصدرون
                </Link>
              )}
              {isSignedIn && (
                <Link href="/profile" style={styles.navLink}>
                  حسابي
                </Link>
              )}
              <Link href="/about" style={styles.navLink}>
                مين عُقاب؟
              </Link>
            </View>
            <Title>الكورسات المتاحة</Title>
            <Muted>الفيديوهات والـSlides مرتبة في مسار واحد، وتقدّمك بيتزامن مع الموقع.</Muted>
          </View>
        }
        renderItem={({ item, index }) => (
          <Link href={{ pathname: "/course/[slug]", params: { slug: item.slug } }} asChild>
            <Pressable style={styles.course}>
              <View style={styles.courseIndex}>
                <Text style={styles.courseIndexText}>{String(index + 1).padStart(2, "0")}</Text>
              </View>
              <View style={styles.courseBody}>
                <Text style={styles.courseTitle}>{item.title}</Text>
                <Text numberOfLines={2} style={styles.courseDescription}>
                  {item.description || "ابدأ الدروس بالترتيب واحفظ نقاطك تلقائيًا."}
                </Text>
                {isSignedIn && <Text style={styles.progress}>{completion(item)}% مكتمل</Text>}
              </View>
            </Pressable>
          </Link>
        )}
        ListEmptyComponent={
          <Card>
            <Title>المحتوى بيتجهّز</Title>
            <Muted>أول كورس منشور هيظهر هنا تلقائيًا.</Muted>
          </Card>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: 40, gap: 12 },
  header: { gap: 16, marginBottom: 8 },
  brand: { backgroundColor: theme.colors.darkPaper, borderRadius: theme.radius.lg, padding: 20 },
  logo: { color: theme.colors.gold, fontSize: 30, fontWeight: "800", textAlign: "right" },
  tagline: { color: theme.colors.darkInk, opacity: 0.8, textAlign: "right" },
  announcement: {
    borderWidth: 1,
    borderColor: theme.colors.gold,
    borderRadius: 10,
    backgroundColor: theme.colors.card,
    padding: 14,
    gap: 5,
  },
  announcementTitle: { color: theme.colors.ink, textAlign: "right", fontWeight: "900" },
  announcementBody: { color: theme.colors.ink, textAlign: "right", opacity: 0.72, lineHeight: 21 },
  metrics: { flexDirection: "row-reverse", gap: 8 },
  metric: {
    backgroundColor: theme.colors.paperAlt,
    borderRadius: 6,
    padding: 8,
    color: theme.colors.ink,
  },
  continue: {
    backgroundColor: theme.colors.gold,
    minHeight: 44,
    borderRadius: 10,
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  continueText: { color: theme.colors.ink, fontWeight: "700", textAlign: "right" },
  signIn: {
    minHeight: 48,
    borderColor: theme.colors.gold,
    borderWidth: 1,
    borderRadius: 10,
    justifyContent: "center",
  },
  signInText: { color: theme.colors.ink, textAlign: "center", fontWeight: "700" },
  nav: { flexDirection: "row-reverse", gap: 16 },
  navLink: { color: theme.colors.gold, fontWeight: "700" },
  course: {
    minHeight: 116,
    flexDirection: "row-reverse",
    backgroundColor: theme.colors.card,
    borderColor: `${theme.colors.ink}22`,
    borderWidth: 1,
    borderRadius: theme.radius.md,
    overflow: "hidden",
  },
  courseIndex: {
    width: 58,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.darkPaper,
  },
  courseIndexText: { color: theme.colors.gold, fontWeight: "800", fontSize: 18 },
  courseBody: { flex: 1, padding: 14, gap: 5 },
  courseTitle: { color: theme.colors.ink, fontSize: 18, fontWeight: "700", textAlign: "right" },
  courseDescription: { color: theme.colors.ink, opacity: 0.68, textAlign: "right", lineHeight: 20 },
  progress: { color: theme.colors.success, textAlign: "right", fontWeight: "700" },
});
