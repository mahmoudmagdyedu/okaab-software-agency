import { useAuth } from "@clerk/expo";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { apiRequest } from "@/api";
import { Action, ErrorState, Loading, Muted, Screen, Title } from "@/components";
import { type AppTheme, useAppTheme, useThemedStyles } from "@/theme";

type LessonResult = {
  lesson: { title: string; task_enabled: boolean; task_prompt: string | null };
};
type TaskGrade = {
  passed: boolean;
  score: number;
  criteria: Array<{ name: string; passed: boolean; note: string }>;
  done_well: string[];
  mistakes: string[];
  hints: string[];
  next_step: string;
};

export default function TaskScreen() {
  const theme = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const { slug, course } = useLocalSearchParams<{ slug: string; course?: string }>();
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [lesson, setLesson] = useState<LessonResult["lesson"] | null>(null);
  const [submission, setSubmission] = useState("");
  const [grade, setGrade] = useState<TaskGrade | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const result = await apiRequest<LessonResult>(
        `/lessons/${encodeURIComponent(slug)}`,
        getToken,
      );
      setLesson(result.lesson);
      setError("");
    } catch (value) {
      setError(value instanceof Error ? value.message : "تعذّر تحميل المهمة");
    }
  };

  useEffect(() => {
    if (isSignedIn) void load();
  }, [slug, isSignedIn]);

  if (!isLoaded || (isSignedIn && !lesson && !error)) return <Loading />;
  if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />;
  if (error && !lesson)
    return (
      <Screen>
        <ErrorState message={error} retry={load} />
      </Screen>
    );
  if (!lesson?.task_enabled || !lesson.task_prompt)
    return (
      <Screen>
        <View style={styles.center}>
          <Title>لا توجد مهمة عملية لهذا الدرس</Title>
          <Action title="العودة إلى الدرس" onPress={() => router.back()} />
        </View>
      </Screen>
    );

  const submit = async () => {
    if (submission.trim().length < 10 || busy) return;
    setBusy(true);
    setError("");
    try {
      const result = await apiRequest<TaskGrade>(
        `/lessons/${encodeURIComponent(slug)}/task/grade`,
        getToken,
        {
          method: "POST",
          body: JSON.stringify({
            submission: submission.trim(),
            idempotencyKey: `mobile-task-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          }),
        },
      );
      setGrade(result);
      if (result.passed) {
        await apiRequest(`/lessons/${encodeURIComponent(slug)}/events`, getToken, {
          method: "POST",
          body: JSON.stringify({
            type: "lesson_finished",
            idempotencyKey: `mobile-task-finished-${Date.now()}`,
          }),
        });
      }
    } catch (value) {
      setError(value instanceof Error ? value.message : "تعذّر تصحيح المهمة");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.kicker}>المهمة العملية</Text>
        <Title>{lesson.title}</Title>
        <View style={styles.promptCard}>
          <Text style={styles.prompt}>{lesson.task_prompt}</Text>
        </View>
        {!grade && (
          <>
            <Text style={styles.label}>اكتب الحل أو الكود ووضّح فكرتك</Text>
            <TextInput
              accessibilityLabel="إجابة المهمة العملية"
              multiline
              textAlignVertical="top"
              value={submission}
              onChangeText={setSubmission}
              placeholder="اكتب إجابتك هنا…"
              placeholderTextColor={`${theme.colors.ink}66`}
              style={styles.input}
            />
            <Muted>الحد الأدنى 10 أحرف. التصحيح يوضح نقاط القوة وما يحتاج للمراجعة.</Muted>
            {error && <Text style={styles.error}>{error}</Text>}
            <Action
              title="صحّح إجابتي"
              onPress={() => void submit()}
              disabled={submission.trim().length < 10}
              loading={busy}
            />
          </>
        )}
        {grade && (
          <View style={[styles.result, grade.passed ? styles.passed : styles.needsWork]}>
            <Text style={styles.score}>
              {grade.passed ? "تم الاجتياز" : "تحتاج محاولة أخرى"} · {grade.score}%
            </Text>
            {grade.criteria.map((item, index) => (
              <View key={`${item.name}-${index}`} style={styles.criterion}>
                <Text style={styles.criterionTitle}>
                  {item.passed ? "✓" : "○"} {item.name}
                </Text>
                <Text style={styles.body}>{item.note}</Text>
              </View>
            ))}
            {grade.done_well.length > 0 && <Feedback title="عملته كويس" items={grade.done_well} />}
            {grade.mistakes.length > 0 && (
              <Feedback title="راجع النقاط دي" items={grade.mistakes} />
            )}
            {grade.hints.length > 0 && <Feedback title="تلميحات" items={grade.hints} />}
            <Text style={styles.next}>{grade.next_step}</Text>
            {!grade.passed && <Action title="عدّل إجابتي" onPress={() => setGrade(null)} />}
            {grade.passed && (
              <Action
                title="افتح المرحلة التالية"
                onPress={() =>
                  course
                    ? router.replace({
                        pathname: "/(tabs)/courses/course/[slug]",
                        params: { slug: course },
                      })
                    : router.replace("/")
                }
              />
            )}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

function Feedback({ title, items }: { title: string; items: string[] }) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.feedback}>
      <Text style={styles.feedbackTitle}>{title}</Text>
      {items.map((item, index) => (
        <Text key={`${item}-${index}`} style={styles.body}>
          • {item}
        </Text>
      ))}
    </View>
  );
}

const createStyles = (theme: AppTheme) => ({
  content: { gap: 14, paddingBottom: 118 },
  center: { flex: 1, justifyContent: "center", gap: 16 },
  kicker: { color: theme.colors.gold, textAlign: "right", fontWeight: "900" },
  promptCard: {
    padding: 16,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.darkPaper,
  },
  prompt: {
    color: theme.colors.paper,
    textAlign: "right",
    writingDirection: "rtl",
    lineHeight: 25,
    fontWeight: "700",
  },
  label: { color: theme.colors.ink, textAlign: "right", fontWeight: "900" },
  input: {
    minHeight: 220,
    borderWidth: 2,
    borderColor: `${theme.colors.ink}55`,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.card,
    color: theme.colors.ink,
    padding: 14,
    textAlign: "right",
    writingDirection: "rtl",
    fontSize: 15,
    lineHeight: 23,
  },
  error: { color: theme.colors.error, textAlign: "right", fontWeight: "700", lineHeight: 22 },
  result: { gap: 14, borderWidth: 2, borderRadius: theme.radius.md, padding: 16 },
  passed: { borderColor: theme.colors.success, backgroundColor: `${theme.colors.success}10` },
  needsWork: { borderColor: theme.colors.gold, backgroundColor: `${theme.colors.gold}10` },
  score: { color: theme.colors.ink, textAlign: "right", fontSize: 22, fontWeight: "900" },
  criterion: {
    gap: 4,
    borderBottomWidth: 1,
    borderBottomColor: `${theme.colors.ink}22`,
    paddingBottom: 10,
  },
  criterionTitle: { color: theme.colors.ink, textAlign: "right", fontWeight: "900" },
  feedback: { gap: 5 },
  feedbackTitle: { color: theme.colors.gold, textAlign: "right", fontWeight: "900" },
  body: { color: theme.colors.ink, textAlign: "right", writingDirection: "rtl", lineHeight: 22 },
  next: {
    color: theme.colors.ink,
    textAlign: "right",
    writingDirection: "rtl",
    fontWeight: "800",
    lineHeight: 23,
  },
});
