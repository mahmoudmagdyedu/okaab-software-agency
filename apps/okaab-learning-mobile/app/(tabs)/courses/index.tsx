import { useAuth } from "@clerk/expo";
import { Link } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";

import { apiRequest } from "@/api";
import { Card, ErrorState, Loading, Muted, Screen, Title } from "@/components";
import { theme } from "@/theme";
import type { Catalog, Course } from "@/types";

export default function CoursesCatalog() {
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

  useEffect(() => {
    if (isLoaded) void load();
  }, [isLoaded, load]);

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
            <Title>الكورسات المتاحة</Title>
            <Muted>الفيديوهات والـSlides مرتبة في مسار واحد، وتقدّمك بيتزامن مع الموقع.</Muted>
          </View>
        }
        renderItem={({ item, index }) => (
          <Link href={{ pathname: "/(tabs)/courses/course/[slug]", params: { slug: item.slug } }} asChild>
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
  header: { gap: 8, marginBottom: 16 },
  course: {
    minHeight: 116,
    flexDirection: "row-reverse",
    backgroundColor: theme.colors.card || "#FFFFFF",
    borderColor: `${theme.colors.ink || "#181511"}22`,
    borderWidth: 1,
    borderRadius: theme.radius?.md || 8,
    overflow: "hidden",
  },
  courseIndex: {
    width: 58,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.darkPaper || "#E8E2D6",
  },
  courseIndexText: { color: theme.colors.gold || "#E8A33D", fontWeight: "800", fontSize: 18 },
  courseBody: { flex: 1, padding: 14, gap: 5 },
  courseTitle: { color: theme.colors.ink || "#181511", fontSize: 18, fontWeight: "700", textAlign: "right" },
  courseDescription: { color: theme.colors.ink || "#181511", opacity: 0.68, textAlign: "right", lineHeight: 20 },
  progress: { color: theme.colors.success || "#388E3C", textAlign: "right", fontWeight: "700" },
});
