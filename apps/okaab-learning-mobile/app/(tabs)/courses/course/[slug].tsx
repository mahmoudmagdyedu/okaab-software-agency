import { useAuth } from "@clerk/expo";
import { Redirect, router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { apiRequest } from "@/api";
import { ErrorState, Loading, Muted, Screen } from "@/components";
import { type AppTheme, useAppTheme, useThemedStyles } from "@/theme";
import Animated, { FadeIn } from "react-native-reanimated";
import { useAppLanguage } from "@/i18n";

type Lesson = {
  id: string;
  slug: string;
  title: string;
  description: string;
  sort_order: number;
  progress_status?: "not_started" | "in_progress" | "completed" | null;
};
type Result = { course: { title: string; description: string }; lessons: Lesson[] };

export default function CourseMapScreen() {
  const theme = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const { tr } = useAppLanguage();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [data, setData] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setError("");
      setData(await apiRequest<Result>(`/courses/${encodeURIComponent(slug)}`, getToken));
    } catch (value) {
      setError(value instanceof Error ? value.message : "تعذّر تحميل مسار الكورس");
    } finally {
      setRefreshing(false);
    }
  }, [getToken, slug]);

  useFocusEffect(useCallback(() => {
    if (isSignedIn) void load();
  }, [isSignedIn, load]));

  const ordered = useMemo(
    () => [...(data?.lessons ?? [])].sort((a, b) => a.sort_order - b.sort_order),
    [data?.lessons],
  );
  const completed = ordered.filter((lesson) => lesson.progress_status === "completed").length;
  const progress = ordered.length ? Math.round((completed / ordered.length) * 100) : 0;

  if (!isLoaded) return <Loading />;
  if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />;
  if (!data && !error) return <Loading />;
  if (error && !data)
    return (
      <Screen>
        <ErrorState message={error} retry={load} />
      </Screen>
    );

  return (
    <Screen>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={theme.colors.gold}
            onRefresh={() => {
              setRefreshing(true);
              void load();
            }}
          />
        }
        contentContainerStyle={styles.content}
      >
        {error ? (
          <Pressable onPress={() => void load()} style={styles.reloadBanner}>
            <Text style={styles.reloadBannerText}>{error} — {tr("اضغط لإعادة التحميل", "tap to reload")}</Text>
          </Pressable>
        ) : null}
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>{tr("مسار تعلّم تفاعلي", "Interactive learning path")}</Text>
          <Text style={styles.courseTitle}>{data!.course.title}</Text>
          <Text style={styles.description}>
            {data!.course.description || tr("أنهِ كل مرحلة لفتح المرحلة التالية وجمع نقاط عُقاب.", "Complete each stage to unlock the next one and earn Okaab points.")}
          </Text>
          <View style={styles.progressRow}>
            <Text style={styles.progressText}>{progress}%</Text>
            <Text style={styles.progressLabel}>
              {completed} {tr("من", "of")} {ordered.length} {tr(ordered.length === 1 ? "مرحلة مكتملة" : "مراحل مكتملة", ordered.length === 1 ? "stage completed" : "stages completed")}
            </Text>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${progress}%` }]} />
          </View>
        </View>

        <View style={styles.map}>
          <View pointerEvents="none" style={styles.path} />
          {ordered.map((lesson, index) => {
            const previousCompleted =
              index === 0 || ordered[index - 1]?.progress_status === "completed";
            const isCompleted = lesson.progress_status === "completed";
            const isCurrent = previousCompleted && !isCompleted;
            const isLocked = !isCompleted && !isCurrent;
            return (
              <Animated.View
                key={lesson.id}
                entering={FadeIn.duration(220)}
                style={[styles.stage, index % 2 === 0 ? styles.leftNode : styles.rightNode]}
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${lesson.title} — ${
                    isCompleted ? "مكتمل" : isLocked ? "مغلق" : "متاح"
                  }`}
                  accessibilityState={{ disabled: isLocked }}
                  disabled={isLocked}
                  onPress={() =>
                    router.push({
                      pathname: "/(tabs)/courses/lesson/[slug]",
                      params: { slug: lesson.slug },
                    })
                  }
                  style={({ pressed }) => [
                    styles.node,
                    isCompleted && styles.nodeCompleted,
                    isCurrent && styles.nodeCurrent,
                    isLocked && styles.nodeLocked,
                    pressed && !isLocked && styles.nodePressed,
                  ]}
                >
                  <Text style={[styles.nodeIcon, isLocked && styles.nodeIconLocked]}>
                    {isCompleted ? "✓" : isLocked ? "◆" : String(index + 1)}
                  </Text>
                </Pressable>
                <View style={[styles.stageCard, isCurrent && styles.stageCardCurrent]}>
                  <Text style={styles.stageNumber}>{tr("المرحلة", "Stage")} {String(index + 1).padStart(2, "0")}</Text>
                  <Text style={styles.stageTitle}>{lesson.title}</Text>
                  <Text numberOfLines={2} style={styles.stageDescription}>
                    {isLocked
                      ? tr("أكمل المرحلة السابقة لفتح هذا الدرس.", "Complete the previous stage to unlock this lesson.")
                      : lesson.description || tr("فيديو، محتوى تفاعلي ثم اختبار قصير.", "Video, interactive content, then a short quiz.")}
                  </Text>
                  <Text style={[styles.state, isCompleted && styles.stateCompleted]}>
                    {isCompleted ? tr("مكتمل + النقاط محفوظة", "Completed + points saved") : isLocked ? tr("مرحلة مغلقة", "Locked stage") : tr("ابدأ الآن", "Start now")}
                  </Text>
                </View>
              </Animated.View>
            );
          })}
        </View>

        {!ordered.length && (
          <View style={styles.empty}>
            <Muted>{tr("لا توجد دروس منشورة في هذا الكورس بعد.", "No lessons have been published in this course yet.")}</Muted>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const createStyles = (theme: AppTheme) => ({
  content: { paddingBottom: 118, gap: 24 },
  reloadBanner: { backgroundColor: `${theme.colors.error}14`, borderWidth: 1, borderColor: theme.colors.error, borderRadius: 12, padding: 10 },
  reloadBannerText: { color: theme.colors.error, textAlign: "center", fontWeight: "800" },
  hero: {
    backgroundColor: theme.colors.darkPaper,
    borderRadius: 28,
    padding: 22,
    gap: 9,
    borderWidth: 1,
    borderColor: `${theme.colors.gold}55`,
  },
  eyebrow: { color: theme.colors.gold, textAlign: "right", fontWeight: "900" },
  courseTitle: { color: theme.colors.darkInk, textAlign: "right", fontSize: 27, fontWeight: "900" },
  description: { color: theme.colors.darkInk, opacity: 0.72, textAlign: "right", lineHeight: 22 },
  progressRow: { direction: "ltr", flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  progressText: { color: theme.colors.gold, fontWeight: "900" },
  progressLabel: { color: theme.colors.darkInk, opacity: 0.75, textAlign: "right", writingDirection: "rtl" },
  track: { height: 7, backgroundColor: "#40372E", borderRadius: 7, overflow: "hidden" },
  fill: { height: "100%", backgroundColor: theme.colors.gold, borderRadius: 7 },
  map: { position: "relative", minHeight: 140, paddingVertical: 10, gap: 28 },
  path: {
    position: "absolute",
    top: 40,
    bottom: 40,
    left: "50%",
    width: 4,
    marginLeft: -2,
    borderRadius: 4,
    backgroundColor: `${theme.colors.gold}52`,
  },
  stage: { width: "86%", gap: 10, zIndex: 1 },
  leftNode: { alignSelf: "flex-start", alignItems: "flex-start" },
  rightNode: { alignSelf: "flex-end", alignItems: "flex-end" },
  node: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.card,
    borderWidth: 4,
    borderColor: theme.colors.ink,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  nodeCompleted: { backgroundColor: theme.colors.ink, borderColor: theme.colors.gold },
  nodeCurrent: { backgroundColor: theme.colors.gold, borderColor: theme.colors.ink },
  nodeLocked: { backgroundColor: theme.colors.paperAlt, borderColor: theme.colors.border },
  nodePressed: { transform: [{ scale: 0.96 }] },
  nodeIcon: { color: theme.colors.ink, fontSize: 23, fontWeight: "900" },
  nodeIconLocked: { color: theme.colors.muted, fontSize: 17 },
  stageCard: {
    width: "100%",
    backgroundColor: theme.colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 15,
    gap: 4,
  },
  stageCardCurrent: { borderColor: theme.colors.gold, borderWidth: 2 },
  stageNumber: { color: theme.colors.gold, textAlign: "right", fontWeight: "900", fontSize: 12 },
  stageTitle: { color: theme.colors.ink, textAlign: "right", fontWeight: "900", fontSize: 17 },
  stageDescription: { color: theme.colors.ink, opacity: 0.62, textAlign: "right", lineHeight: 20 },
  state: { color: theme.colors.gold, textAlign: "right", fontWeight: "800", marginTop: 4 },
  stateCompleted: { color: theme.colors.success },
  empty: { padding: 24, alignItems: "center" },
});
