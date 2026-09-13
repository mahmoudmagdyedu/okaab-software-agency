import { useAuth } from "@clerk/expo";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { apiRequest } from "@/api";
import { Action, ErrorState, Loading, Muted, Screen, Title } from "@/components";
import { type AppTheme, useThemedStyles } from "@/theme";
import { useAppLanguage } from "@/i18n";

type QuizOption = { id: string; option_text: string };
type QuizQuestion = {
  id: string;
  question_text: string;
  level: "easy" | "medium" | "apply";
  options: QuizOption[];
};
type AnswerResult = { correct: boolean; explanation: string; pointsAwarded: number };

export default function QuizScreen() {
  const styles = useThemedStyles(createStyles);
  const { tr } = useAppLanguage();
  const { slug, next: nextStep, course } = useLocalSearchParams<{
    slug: string;
    next?: "task" | "finish";
    course?: string;
  }>();
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState("");
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [correct, setCorrect] = useState(0);
  const [busy, setBusy] = useState(false);
  const [finished, setFinished] = useState(false);
  const [bestScore, setBestScore] = useState(0);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setQuestions(await apiRequest<QuizQuestion[]>(`/lessons/${encodeURIComponent(slug)}/quiz`, getToken));
      setError("");
    } catch (value) {
      setError(value instanceof Error ? value.message : "تعذّر تحميل الاختبار");
    }
  };

  useEffect(() => {
    void load();
  }, [slug]);

  const question = questions?.[index];
  const score = useMemo(
    () => (questions?.length ? Math.round((correct / questions.length) * 100) : 0),
    [correct, questions?.length],
  );

  if (!isLoaded || (!questions && !error)) return <Loading />;
  if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />;
  if (error && !questions)
    return (
      <Screen>
        <ErrorState message={error} retry={load} />
      </Screen>
    );

  if (!questions?.length)
    return (
      <Screen>
        <View style={styles.empty}>
          <Title>{tr("لا يوجد اختبار لهذا الدرس", "No quiz for this lesson")}</Title>
          <Muted>{tr("ارجع للدرس وكمل المحتوى، وسيظهر الاختبار هنا عند نشره.", "Return to the lesson and continue the content. The quiz will appear when it is published.")}</Muted>
          <Action title={tr("العودة إلى الدرس", "Back to lesson")} onPress={() => router.back()} />
        </View>
      </Screen>
    );

  const submit = async () => {
    if (!question || !selected || busy) return;
    setBusy(true);
    setError("");
    try {
      const answer = await apiRequest<AnswerResult>("/quiz/answers", getToken, {
        method: "POST",
        body: JSON.stringify({
          questionId: question.id,
          optionId: selected,
          idempotencyKey: `mobile-quiz-${Date.now()}-${question.id}`.slice(0, 100),
        }),
      });
      setResult(answer);
      if (answer.correct) setCorrect((value) => value + 1);
    } catch (value) {
      setError(value instanceof Error ? value.message : "تعذّر تسجيل الإجابة");
    } finally {
      setBusy(false);
    }
  };

  const next = async () => {
    if (index < questions.length - 1) {
      setIndex((value) => value + 1);
      setSelected("");
      setResult(null);
      setError("");
      return;
    }
    setBusy(true);
    const finalCorrect = correct;
    const finalScore = Math.round((finalCorrect / questions.length) * 100);
    try {
      await apiRequest(`/lessons/${encodeURIComponent(slug)}/events`, getToken, {
        method: "POST",
        body: JSON.stringify({
          type: "quiz_finished",
          score: finalScore,
          idempotencyKey: `mobile-quiz-finished-${Date.now()}`,
        }),
      });
      let completed = false;
      if (nextStep !== "task") {
        const completion = await apiRequest<{ completed?: boolean }>(`/lessons/${encodeURIComponent(slug)}/events`, getToken, {
          method: "POST",
          body: JSON.stringify({
            type: "lesson_finished",
            idempotencyKey: `mobile-lesson-finished-${Date.now()}`,
          }),
        });
        completed = Boolean(completion.completed);
      }
      setBestScore((value) => Math.max(value, finalScore));
      setLessonCompleted(completed);
      setFinished(true);
    } catch (value) {
      setError(value instanceof Error ? value.message : "تم حفظ الإجابات وتعذّر إنهاء الدرس");
    } finally {
      setBusy(false);
    }
  };

  if (finished)
    return (
      <Screen>
        <View style={styles.empty}>
          <Text style={styles.resultMark}>{score >= 70 ? tr("أحسنت!", "Well done!") : tr("محاولة جيدة", "Good attempt")}</Text>
          <Title>{tr("نتيجتك", "Your score")} {score}%</Title>
          <Muted>
            أجبت عن {correct} من {questions.length}. نقاط الإجابات الصحيحة من أول محاولة أُضيفت
            تلقائيًا.
          </Muted>
          <Muted>{tr("أفضل نتيجة في هذه الجلسة", "Best score in this session")}: {Math.max(bestScore, score)}%</Muted>
          {nextStep !== "task" && !lessonCompleted ? (
            <Text style={styles.error}>الدرس لم يكتمل بعد. أعد الاختبار للإجابة عن الأسئلة المتبقية بشكل صحيح.</Text>
          ) : null}
          <Action
            title={nextStep === "task"
              ? tr("انتقل إلى المهمة العملية", "Continue to the practical task")
              : lessonCompleted
                ? tr("افتح المرحلة التالية", "Open next stage")
                : tr("العودة إلى الكورس", "Back to course")}
            onPress={() =>
              nextStep === "task"
                ? router.replace({
                    pathname: "/(tabs)/courses/task/[slug]",
                    params: { slug, course: course || "" },
                  })
                : course
                  ? router.replace({
                      pathname: "/(tabs)/courses/course/[slug]",
                      params: { slug: course },
                    })
                  : router.replace("/")
            }
          />
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setIndex(0);
              setSelected("");
              setResult(null);
              setCorrect(0);
              setFinished(false);
              setLessonCompleted(false);
              setError("");
            }}
            style={styles.retake}
          >
            <Text style={styles.retakeText}>{tr("إعادة الاختبار", "Retake quiz")}</Text>
          </Pressable>
        </View>
      </Screen>
    );

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.progressRow}>
          <Text style={styles.progressText}>
            {tr("السؤال", "Question")} {index + 1} {tr("من", "of")} {questions.length}
          </Text>
          <Text style={styles.level}>
            المستوى{" "}
            {question!.level === "easy" ? "سهل" : question!.level === "apply" ? "تطبيق" : "متوسط"}
          </Text>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${((index + 1) / questions.length) * 100}%` }]} />
        </View>
        <Title>{question!.question_text}</Title>
        <View accessibilityRole="radiogroup" style={styles.options}>
          {question!.options.map((option) => {
            const active = selected === option.id;
            return (
              <Pressable
                key={option.id}
                accessibilityRole="radio"
                accessibilityState={{ checked: active, disabled: Boolean(result) }}
                disabled={Boolean(result)}
                onPress={() => setSelected(option.id)}
                style={[styles.option, active && styles.optionActive]}
              >
                <View style={[styles.radio, active && styles.radioActive]} />
                <Text style={styles.optionText}>{option.option_text}</Text>
              </Pressable>
            );
          })}
        </View>
        {result && (
          <View style={[styles.feedback, result.correct ? styles.correct : styles.wrong]}>
            <Text style={styles.feedbackTitle}>
              {result.correct ? "إجابة صحيحة" : "إجابة غير صحيحة"}
            </Text>
            <Text style={styles.feedbackText}>
              {result.explanation || "راجع النقطة في الدرس وجرب تاني."}
            </Text>
            {result.pointsAwarded > 0 && (
              <Text style={styles.points}>+{result.pointsAwarded} نقاط</Text>
            )}
          </View>
        )}
        {error && <Text style={styles.error}>{error}</Text>}
        {!result ? (
          <Action
            title={tr("تأكيد الإجابة", "Submit answer")}
            onPress={() => void submit()}
            disabled={!selected}
            loading={busy}
          />
        ) : (
          <Action
            title={index === questions.length - 1 ? tr("عرض النتيجة", "Show result") : tr("السؤال التالي", "Next question")}
            onPress={() => void next()}
            loading={busy}
          />
        )}
      </ScrollView>
    </Screen>
  );
}

const createStyles = (theme: AppTheme) => ({
  content: { gap: 16, paddingBottom: 118 },
  empty: { flex: 1, justifyContent: "center", gap: 16 },
  progressRow: { flexDirection: "row-reverse", justifyContent: "space-between" },
  progressText: { color: theme.colors.ink, fontWeight: "800" },
  level: { color: theme.colors.gold, fontWeight: "800" },
  track: {
    height: 8,
    backgroundColor: `${theme.colors.ink}20`,
    borderRadius: 8,
    overflow: "hidden",
  },
  fill: { height: "100%", backgroundColor: theme.colors.gold },
  options: { gap: 10 },
  option: {
    minHeight: 58,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: `${theme.colors.ink}38`,
    borderRadius: theme.radius.md,
    padding: 14,
    backgroundColor: theme.colors.card,
  },
  optionActive: { borderColor: theme.colors.gold, borderWidth: 2 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: `${theme.colors.ink}70`,
  },
  radioActive: { borderColor: theme.colors.gold, backgroundColor: theme.colors.gold },
  optionText: {
    flex: 1,
    color: theme.colors.ink,
    textAlign: "right",
    fontWeight: "700",
    lineHeight: 22,
  },
  feedback: { padding: 14, borderRadius: theme.radius.md, gap: 6, borderWidth: 1 },
  correct: { borderColor: theme.colors.success, backgroundColor: `${theme.colors.success}12` },
  wrong: { borderColor: theme.colors.error, backgroundColor: `${theme.colors.error}12` },
  feedbackTitle: { color: theme.colors.ink, textAlign: "right", fontWeight: "900" },
  feedbackText: { color: theme.colors.ink, textAlign: "right", lineHeight: 22 },
  points: { color: theme.colors.success, textAlign: "right", fontWeight: "900" },
  error: { color: theme.colors.error, textAlign: "right", fontWeight: "700" },
  resultMark: { color: theme.colors.gold, textAlign: "right", fontSize: 34, fontWeight: "900" },
  retake: { minHeight: 48, borderWidth: 1, borderColor: theme.colors.gold, borderRadius: theme.radius.md, alignItems: "center", justifyContent: "center" },
  retakeText: { color: theme.colors.gold, fontWeight: "900" },
});
