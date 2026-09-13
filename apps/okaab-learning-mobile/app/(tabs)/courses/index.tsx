import { useAuth } from "@clerk/expo";
import { Link, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { apiRequest } from "@/api";
import { Card, ErrorState, Loading, Muted, Screen, Title } from "@/components";
import { type AppTheme, useAppTheme, useThemedStyles } from "@/theme";
import type { Catalog, Course } from "@/types";
import { useAppLanguage } from "@/i18n";

export default function CoursesCatalog() {
  const theme = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const { tr } = useAppLanguage();
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setError("");
      const nextCatalog = await apiRequest<Catalog>("/catalog", isSignedIn ? getToken : undefined);
      setCatalog(nextCatalog);
    } catch (value) {
      setError(value instanceof Error ? value.message : "تعذّر الاتصال");
    } finally {
      setRefreshing(false);
    }
  }, [getToken, isSignedIn]);

  useFocusEffect(useCallback(() => {
    if (isLoaded) void load();
  }, [isLoaded, load]));

  if (!isLoaded || (!catalog && !error)) return <Loading />;
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
            <Title>{tr("الكورسات المتاحة", "Available courses")}</Title>
            <Muted>{tr("الفيديوهات والـSlides مرتبة في مسار واحد، وتقدّمك بيتزامن مع الموقع.", "Videos and slides are organized into one path, and your progress syncs with the website.")}</Muted>
            {error ? (
              <Pressable onPress={() => void load()} style={styles.reloadBanner}>
                <Text style={styles.reloadBannerText}>{error} — {tr("اضغط لإعادة التحميل", "tap to reload")}</Text>
              </Pressable>
            ) : null}
          </View>
        }
        renderItem={({ item, index }) => {
          const percent = completion(item);
          return (
            <Animated.View entering={FadeIn.duration(220)}>
              <Link href={{ pathname: "/(tabs)/courses/course/[slug]", params: { slug: item.slug } }} asChild>
                <Pressable style={({ pressed }) => [styles.course, pressed && styles.coursePressed]}>
                  <View style={styles.courseIndex}>
                    <Text style={styles.courseIndexText}>{String(index + 1).padStart(2, "0")}</Text>
                    <Text style={styles.courseIndexLabel}>{tr("مسار", "Path")}</Text>
                  </View>
                  <View style={styles.courseBody}>
                    <Text style={styles.courseTitle}>{item.title}</Text>
                    <Text numberOfLines={2} style={styles.courseDescription}>
                      {item.description || tr("ابدأ الدروس بالترتيب واحفظ نقاطك تلقائيًا.", "Start the lessons in order and save your points automatically.")}
                    </Text>
                    {isSignedIn && (
                      <View style={styles.progressWrap}>
                        <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${percent}%` }]} /></View>
                        <Text style={styles.progress}>{percent}%</Text>
                      </View>
                    )}
                  </View>
                </Pressable>
              </Link>
            </Animated.View>
          );
        }}
        ListEmptyComponent={
          <Card>
            <Title>{tr("المحتوى بيتجهّز", "Content is being prepared")}</Title>
            <Muted>{tr("أول كورس منشور هيظهر هنا تلقائيًا.", "The first published course will appear here automatically.")}</Muted>
          </Card>
        }
      />
    </Screen>
  );
}

const createStyles = (theme: AppTheme) => ({
  list: { paddingBottom: 118, gap: 12 },
  header: { gap: 8, marginBottom: 16 },
  reloadBanner: { backgroundColor: `${theme.colors.error}14`, borderWidth: 1, borderColor: theme.colors.error, borderRadius: 12, padding: 10 },
  reloadBannerText: { color: theme.colors.error, textAlign: "center", fontWeight: "800" },
  course: {
    minHeight: 116,
    flexDirection: "row-reverse",
    backgroundColor: theme.colors.card || "#FFFFFF",
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 22,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  coursePressed: { transform: [{ scale: 0.985 }], opacity: 0.92 },
  courseIndex: {
    width: 58,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.darkPaper || "#E8E2D6",
  },
  courseIndexText: { color: theme.colors.gold || "#E8A33D", fontWeight: "800", fontSize: 18 },
  courseIndexLabel: { color: theme.colors.darkInk, opacity: 0.55, fontWeight: "800", fontSize: 10 },
  courseBody: { flex: 1, padding: 14, gap: 5 },
  courseTitle: { color: theme.colors.ink || "#181511", fontSize: 18, fontWeight: "700", textAlign: "right" },
  courseDescription: { color: theme.colors.ink || "#181511", opacity: 0.68, textAlign: "right", lineHeight: 20 },
  progressWrap: { flexDirection: "row-reverse", alignItems: "center", gap: 8, marginTop: 3 },
  progressTrack: { flex: 1, height: 6, backgroundColor: theme.colors.border, borderRadius: 6, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: theme.colors.gold, borderRadius: 6 },
  progress: { color: theme.colors.success || "#388E3C", textAlign: "right", fontWeight: "800", fontSize: 11 },
});
