import { useAuth } from "@clerk/expo";
import NetInfo from "@react-native-community/netinfo";
import { createBridgeScript } from "@okaab/bridge";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { WebView } from "react-native-webview";
import YoutubePlayer, { type YoutubeIframeRef } from "react-native-youtube-iframe";

import { apiRequest, enqueueEvent, flushEvents } from "@/api";
import { Action, ErrorState, Loading, Muted, Screen, Title } from "@/components";
import { type AppTheme, useAppTheme, useThemedStyles } from "@/theme";
import { useAppLanguage } from "@/i18n";

type LessonProgress = {
  last_slide?: number;
  video_percent?: number;
  status?: string;
} | null;
type Result = {
  lesson: {
    title: string;
    description: string;
    course_slug: string;
    quiz_count: number;
    task_enabled: boolean;
    required_slide_index?: number | null;
  };
  videos: { youtube_video_id: string }[];
  slideDecks: { id: string; title: string; entry_path?: string; allow_download?: boolean }[];
  progress: LessonProgress;
};
type Stage = "video" | "slides" | "quiz";
type SlideQuizReceipt = { scorePercent: number; awardedXp: number; duplicate?: boolean };

function createAttemptId() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (value) => {
    const random = Math.floor(Math.random() * 16);
    return (value === "x" ? random : (random & 0x3) | 0x8).toString(16);
  });
}

const ANDROID_BROWSER_USER_AGENT =
  "Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36";

export default function LessonScreen() {
  const theme = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const { tr } = useAppLanguage();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { width } = useWindowDimensions();
  const playerRef = useRef<YoutubeIframeRef>(null);
  const slidesRef = useRef<WebView>(null);
  const [data, setData] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [playerError, setPlayerError] = useState("");
  const [online, setOnline] = useState(true);
  const [stage, setStage] = useState<Stage>("video");
  const [videoPercent, setVideoPercent] = useState(0);
  const [lastSlide, setLastSlide] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [rate, setRate] = useState(1);
  const [playerRevision, setPlayerRevision] = useState(0);
  const [playerReady, setPlayerReady] = useState(false);
  const [playerFrameLoaded, setPlayerFrameLoaded] = useState(false);
  const [deckIndex, setDeckIndex] = useState(0);
  const [slideRevision, setSlideRevision] = useState(0);
  const [slideLoading, setSlideLoading] = useState(false);
  const [slideError, setSlideError] = useState("");
  const [viewedDecks, setViewedDecks] = useState<string[]>([]);
  const [slideQuizReceipt, setSlideQuizReceipt] = useState<SlideQuizReceipt | null>(null);
  const [savingSlideQuiz, setSavingSlideQuiz] = useState(false);

  const load = useCallback(async () => {
    try {
      const next = await apiRequest<Result>(`/lessons/${encodeURIComponent(slug)}`, getToken);
      setData(next);
      setPlayerError("");
      setPlayerReady(false);
      setPlayerFrameLoaded(false);
      setDeckIndex(0);
      setSlideError("");
      setViewedDecks([]);
      setSlideQuizReceipt(null);
      const nextVideo = Number(next.progress?.video_percent || 0);
      const nextSlide = Number(next.progress?.last_slide || 0);
      setVideoPercent(nextVideo);
      setLastSlide(nextSlide);
      if (!next.videos.length || nextVideo >= 85) {
        setStage(next.slideDecks.length ? "slides" : "quiz");
      } else {
        setStage("video");
      }
      setError("");
    } catch (value) {
      setError(value instanceof Error ? value.message : "تعذّر تحميل الدرس");
    }
  }, [getToken, slug]);

  useEffect(() => {
    if (isSignedIn) void load();
    const off = NetInfo.addEventListener((state) => {
      setOnline(Boolean(state.isConnected));
      if (state.isConnected && isSignedIn) void flushEvents(getToken);
    });
    return off;
  }, [getToken, isSignedIn, load]);

  useEffect(() => {
    if (!data?.videos[0] || stage !== "video" || playerFrameLoaded || playerError) return;
    const timeout = setTimeout(
      () => setPlayerError("لم يستجب مشغّل YouTube. يمكنك إعادة المحاولة أو متابعة الشرح دون تعطيل الدرس."),
      15000,
    );
    return () => clearTimeout(timeout);
  }, [data?.videos, playerError, playerFrameLoaded, playerRevision, stage]);

  useEffect(() => {
    if (!slideLoading || stage !== "slides") return;
    const timeout = setTimeout(() => {
      setSlideLoading(false);
      setSlideError("استغرق تحميل العرض أكثر من 20 ثانية. تحقق من الإنترنت ثم حاول مرة أخرى.");
    }, 20_000);
    return () => clearTimeout(timeout);
  }, [slideLoading, slideRevision, stage]);

  const sendProgress = useCallback(async <T = unknown,>(event: Record<string, unknown>): Promise<T | null> => {
    const payload = {
      ...event,
      idempotencyKey:
        typeof event.idempotencyKey === "string"
          ? event.idempotencyKey
          : `mobile-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    };
    if (online) {
      return await apiRequest<T>(`/lessons/${encodeURIComponent(slug)}/events`, getToken, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    } else {
      await enqueueEvent(slug, payload);
      return null;
    }
  }, [getToken, online, slug]);

  useEffect(() => {
    if (!playerReady || stage !== "video") return;
    let cancelled = false;
    const sample = async () => {
      try {
        const [current, duration] = await Promise.all([
          playerRef.current?.getCurrentTime(),
          playerRef.current?.getDuration(),
        ]);
        if (cancelled || !duration || !current) return;
        const percent = Math.max(0, Math.min(100, (current / duration) * 100));
        setVideoPercent((previous) => {
          if (percent - previous >= 4) {
            void sendProgress({ type: "video_progress", percent, currentTime: current, duration });
            return percent;
          }
          return previous;
        });
      } catch {
        // The native player can briefly reject while changing fullscreen state.
      }
    };
    const interval = setInterval(() => void sample(), 2500);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [playerReady, sendProgress, stage]);

  if (!isLoaded) return <Loading />;
  if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />;
  if (!data && !error) return <Loading />;
  if (error && !data)
    return (
      <Screen>
        <ErrorState message={error} retry={load} />
      </Screen>
    );

  const activeDeck = data!.slideDecks[deckIndex] ?? data!.slideDecks[0];

  const handleMessage = async (raw: string) => {
    try {
      const event = JSON.parse(raw) as Record<string, unknown>;
      const type = String(event.type || "");
      if (type === "slide_changed") {
        const index = Math.max(0, Number(event.index) || 0);
        setLastSlide((current) => Math.max(current, index));
        await sendProgress(event);
        return;
      }
      if ((type === "quiz_finished" || type === "quiz_completed") && activeDeck) {
        const total = Math.max(1, Math.round(Number(event.totalQuestions ?? event.total ?? event.questionCount ?? 10) || 10));
        const explicitCorrect = Number(event.correctAnswers ?? event.correct);
        const reportedScore = Number(event.scorePercent ?? event.percent ?? event.score);
        const correctAnswers = Number.isFinite(explicitCorrect)
          ? Math.max(0, Math.min(total, Math.round(explicitCorrect)))
          : Number.isFinite(reportedScore) && reportedScore > total
            ? Math.max(0, Math.min(total, Math.round((reportedScore / 100) * total)))
            : Math.max(0, Math.min(total, Math.round(reportedScore || 0)));
        const scorePercent = Math.round((correctAnswers / total) * 100);
        const attemptId = typeof event.attemptId === "string" ? event.attemptId : createAttemptId();
        const idempotencyKey = `quiz:${attemptId}`;
        setSavingSlideQuiz(true);
        setSlideError("");
        try {
          const receipt = await sendProgress<SlideQuizReceipt>({
            type: "quiz_completed",
            attemptId,
            deckId: activeDeck.id,
            courseSlug: data!.lesson.course_slug,
            lessonSlug: slug,
            lessonNumber: 0,
            questionSetVersion:
              typeof event.questionSetVersion === "string" && event.questionSetVersion.length >= 8
                ? event.questionSetVersion
                : `deck-${activeDeck.id}-v1`,
            correctAnswers,
            totalQuestions: total,
            scorePercent,
            completedAt: new Date().toISOString(),
            idempotencyKey,
          });
          setLastSlide((current) => Math.max(current, Number(data!.lesson.required_slide_index ?? 1)));
          setSlideQuizReceipt(receipt ?? { scorePercent, awardedXp: 0 });
          setStage("quiz");
        } catch (value) {
          setSlideError(value instanceof Error ? value.message : "تعذّر حفظ نتيجة الاختبار.");
        } finally {
          setSavingSlideQuiz(false);
        }
      }
    } catch {
      // Ignore malformed messages from third-party iframe contents.
    }
  };

  const retryPlayer = () => {
    setPlayerError("");
    setPlayerReady(false);
    setPlayerFrameLoaded(false);
    setPlayerRevision((current) => current + 1);
  };
  const continueWithoutVideo = () => {
    setStage(data!.slideDecks.length ? "slides" : "quiz");
  };
  const activeEntryPath = (activeDeck?.entry_path || "index.html")
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
  const slideUrl = activeDeck
    ? `https://okaab.org/slides/${encodeURIComponent(activeDeck.id)}/${activeEntryPath}`
    : "";
  const slideHeight = Math.max(260, Math.min(500, (width - 56) * 0.72));
  const requiredSlide = Number(data!.lesson.required_slide_index ?? 1);
  const slidesReady = !data!.slideDecks.length || lastSlide >= requiredSlide;
  const selectDeck = (nextIndex: number) => {
    if (nextIndex < 0 || nextIndex >= data!.slideDecks.length || nextIndex === deckIndex) return;
    setDeckIndex(nextIndex);
    setSlideError("");
    setSlideLoading(true);
    setSlideRevision((current) => current + 1);
  };
  const goToQuiz = () => {
    if (data!.lesson.quiz_count > 0) {
      router.replace({
        pathname: "/(tabs)/courses/quiz/[slug]",
        params: {
          slug,
          next: data!.lesson.task_enabled ? "task" : "finish",
          course: data!.lesson.course_slug,
        },
      });
      return;
    }
    if (data!.lesson.task_enabled) {
      router.replace({
        pathname: "/(tabs)/courses/task/[slug]",
        params: { slug, course: data!.lesson.course_slug },
      });
      return;
    }
    void sendProgress({ type: "lesson_finished" }).then(() =>
      router.replace({
        pathname: "/(tabs)/courses/course/[slug]",
        params: { slug: data!.lesson.course_slug },
      }),
    );
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        {!online && (
          <Text style={styles.offline}>{tr("أنت غير متصل — سيُرسل تقدّمك تلقائيًا عند عودة الإنترنت.", "You're offline — your progress will sync automatically when the connection returns.")}</Text>
        )}
        <View style={styles.lessonHeader}>
          <Text style={styles.kicker}>{tr("درس تفاعلي", "Interactive lesson")}</Text>
          <Title>{data!.lesson.title}</Title>
          <Muted>{data!.lesson.description || tr("شاهد، طبّق، ثم اختبر فهمك لفتح المرحلة التالية.", "Watch, practice, then test your understanding to unlock the next stage.")}</Muted>
        </View>

        <View style={styles.steps}>
          {(["video", "slides", "quiz"] as Stage[]).map((item, index) => (
            <View key={item} style={styles.stepWrap}>
              <View style={[styles.step, stage === item && styles.stepActive]}>
                <Text style={[styles.stepText, stage === item && styles.stepTextActive]}>
                  {index + 1}
                </Text>
              </View>
              <Text style={styles.stepLabel}>
                {item === "video" ? tr("الفيديو", "Video") : item === "slides" ? tr("الشرح", "Slides") : tr("الأسئلة", "Quiz")}
              </Text>
            </View>
          ))}
        </View>

        {stage === "video" && data!.videos[0] && (
          <View style={styles.playerCard}>
            <View style={styles.videoFrame}>
              <YoutubePlayer
                key={`${data!.videos[0].youtube_video_id}-${playerRevision}`}
                ref={playerRef}
                height={230}
                width={Math.max(280, width - 56)}
                videoId={data!.videos[0].youtube_video_id}
                play={playing}
                mute={muted}
                playbackRate={rate}
                forceAndroidAutoplay={false}
                initialPlayerParams={{ controls: true, preventFullScreen: false, rel: false }}
                webViewProps={{
                  userAgent: ANDROID_BROWSER_USER_AGENT,
                  androidLayerType: "hardware",
                  setSupportMultipleWindows: false,
                }}
                onReady={() => {
                  setPlayerError("");
                  setPlayerFrameLoaded(true);
                  setPlayerReady(true);
                }}
                onChangeState={(state: string) => {
                  setPlaying(state === "playing");
                  if (state === "ended") {
                    setVideoPercent(100);
                    void sendProgress({ type: "video_finished", percent: 100 });
                    setStage(data!.slideDecks.length ? "slides" : "quiz");
                  }
                }}
                onError={(code: string) => {
                  setPlayerReady(false);
                  setPlayerFrameLoaded(false);
                  setPlayerError(
                    code === "video_not_found"
                      ? "الفيديو غير متاح أو أصبح خاصًا."
                      : code === "embed_not_allowed"
                        ? "صاحب الفيديو منع تشغيله داخل التطبيقات."
                        : "تعذّر تشغيل الفيديو من YouTube على هذا الجهاز.",
                  );
                }}
              />
              {!playerFrameLoaded && !playerError ? (
                <View pointerEvents="none" style={styles.playerLoading}>
                  <ActivityIndicator color={theme.colors.gold} size="large" />
                  <Text style={styles.playerLoadingText}>جارٍ تجهيز الفيديو داخل عُقاب…</Text>
                </View>
              ) : null}
              {playerError ? (
                <View style={styles.playerError}>
                  <Text style={styles.playerErrorTitle}>الفيديو لم يبدأ</Text>
                  <Text style={styles.playerErrorText}>{playerError}</Text>
                  <View style={styles.playerErrorActions}>
                    <Pressable onPress={retryPlayer} style={styles.retry}>
                      <Text style={styles.retryText}>إعادة المحاولة</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => void Linking.openURL(`https://www.youtube.com/watch?v=${data!.videos[0].youtube_video_id}`)}
                      style={styles.openYouTube}
                    >
                      <Text style={styles.openYouTubeText}>فتح في YouTube</Text>
                    </Pressable>
                  </View>
                  <Pressable onPress={continueWithoutVideo} style={styles.skipVideo}>
                    <Text style={styles.skipVideoText}>فتح الشرح والـSlides مؤقتًا</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
            <View style={styles.controlRail}>
              <Pressable
                accessibilityLabel={playing ? "إيقاف مؤقت" : "تشغيل"}
                disabled={!playerReady}
                onPress={() => setPlaying((value) => !value)}
                style={[styles.controlPrimary, !playerReady && styles.controlDisabled]}
              >
                <Text style={styles.controlPrimaryText}>{playing ? "Ⅱ" : "▶"}</Text>
              </Pressable>
              <Pressable
                accessibilityLabel={muted ? "تشغيل الصوت" : "كتم الصوت"}
                disabled={!playerReady}
                onPress={() => {
                  setMuted((value) => !value);
                }}
                style={[styles.control, !playerReady && styles.controlDisabled]}
              >
                <Text style={styles.controlText}>{muted ? "صوت" : "كتم"}</Text>
              </Pressable>
              <Pressable
                accessibilityLabel="تغيير سرعة الفيديو"
                disabled={!playerReady}
                onPress={() => {
                  const speeds = [1, 1.25, 1.5, 2];
                  const next = speeds[(speeds.indexOf(rate) + 1) % speeds.length] ?? 1;
                  setRate(next);
                }}
                style={[styles.control, !playerReady && styles.controlDisabled]}
              >
                <Text style={styles.controlText}>×{rate}</Text>
              </Pressable>
              <View style={styles.videoTrack}>
                <View style={[styles.videoFill, { width: `${videoPercent}%` }]} />
              </View>
              <Text style={styles.videoPercent}>{Math.round(videoPercent)}%</Text>
            </View>
            <Text style={styles.qualityHint}>
              إعدادات الجودة والترجمة وملء الشاشة متاحة من إعدادات المشغل داخل الفيديو.
            </Text>
            {videoPercent >= 85 && (
              <Action
                title={data!.slideDecks.length ? "الانتقال إلى الشرح" : "الانتقال إلى الأسئلة"}
                onPress={() => setStage(data!.slideDecks.length ? "slides" : "quiz")}
              />
            )}
          </View>
        )}

        {stage === "slides" && activeDeck && (
          <View style={styles.slidesCard}>
            <View style={styles.slidesHeading}>
              <View>
                <Text style={styles.deckCounter}>{tr("عرض", "Deck")} {deckIndex + 1} {tr("من", "of")} {data!.slideDecks.length}</Text>
                <Text style={styles.sectionTitle}>{activeDeck.title}</Text>
              </View>
              <Pressable
                accessibilityLabel="إعادة تحميل العرض"
                onPress={() => {
                  setSlideError("");
                  setSlideLoading(true);
                  setSlideRevision((current) => current + 1);
                }}
                style={styles.slideReload}
              >
                <Text style={styles.slideReloadText}>{tr("تحديث", "Reload")}</Text>
              </Pressable>
            </View>
            {data!.slideDecks.length > 1 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.deckTabs}>
                {data!.slideDecks.map((deck, index) => (
                  <Pressable
                    key={deck.id}
                    onPress={() => selectDeck(index)}
                    style={[styles.deckTab, index === deckIndex && styles.deckTabActive]}
                  >
                    <Text style={[styles.deckTabText, index === deckIndex && styles.deckTabTextActive]} numberOfLines={1}>
                      {index + 1}. {deck.title}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            ) : null}
            <View style={[styles.slidesViewport, { height: slideHeight }]}>
              <WebView
                key={`${activeDeck.id}-${slideRevision}`}
                ref={slidesRef}
                source={{ uri: slideUrl }}
                style={styles.slides}
                userAgent={ANDROID_BROWSER_USER_AGENT}
                javaScriptEnabled
                domStorageEnabled
                allowsFullscreenVideo
                setSupportMultipleWindows={false}
                injectedJavaScriptBeforeContentLoaded={createBridgeScript()}
                originWhitelist={["https://*"]}
                onLoadStart={() => {
                  setSlideLoading(true);
                  setSlideError("");
                }}
                onLoad={() => {
                  setViewedDecks((current) => current.includes(activeDeck.id) ? current : [...current, activeDeck.id]);
                }}
                onLoadEnd={() => setSlideLoading(false)}
                onError={() => {
                  setSlideLoading(false);
                  setSlideError("تعذّر فتح العرض داخل التطبيق.");
                }}
                onHttpError={(event) => {
                  setSlideLoading(false);
                  setSlideError(`تعذّر فتح العرض (رمز ${event.nativeEvent.statusCode}).`);
                }}
                onMessage={(event) => void handleMessage(event.nativeEvent.data)}
              />
              {slideLoading ? (
                <View pointerEvents="none" style={styles.slideOverlay}>
                  <ActivityIndicator color={theme.colors.gold} size="large" />
                  <Text style={styles.slideOverlayText}>جارٍ تحميل العرض…</Text>
                </View>
              ) : null}
              {slideError ? (
                <View style={styles.slideOverlay}>
                  <Text style={styles.slideErrorTitle}>تعذّر عرض الـSlides</Text>
                  <Text style={styles.slideOverlayText}>{slideError}</Text>
                  <Pressable onPress={() => setSlideRevision((current) => current + 1)} style={styles.retry}>
                    <Text style={styles.retryText}>إعادة المحاولة</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
            <View style={styles.deckNavigation}>
              <Pressable disabled={deckIndex === 0} onPress={() => selectDeck(deckIndex - 1)} style={[styles.deckNavButton, deckIndex === 0 && styles.deckNavDisabled]}>
                <Text style={styles.deckNavText}>{tr("السابق", "Previous")}</Text>
              </Pressable>
              <Pressable disabled={deckIndex === data!.slideDecks.length - 1} onPress={() => selectDeck(deckIndex + 1)} style={[styles.deckNavButton, deckIndex === data!.slideDecks.length - 1 && styles.deckNavDisabled]}>
                <Text style={styles.deckNavText}>{tr("التالي", "Next")}</Text>
              </Pressable>
            </View>
            <Text style={styles.slideProgress}>
              آخر شريحة محفوظة: {lastSlide + 1} • العروض المفتوحة: {viewedDecks.length}/{data!.slideDecks.length}
            </Text>
            <Action
              title={data!.lesson.quiz_count ? tr("ابدأ أسئلة الدرس", "Start lesson quiz") : tr("إكمال المرحلة", "Continue")}
              disabled={!slidesReady}
              onPress={() => setStage("quiz")}
            />
            {!slidesReady && (
              <Muted>استمر داخل العرض حتى تصل إلى المحتوى المطلوب، ثم سيتفعّل الزر.</Muted>
            )}
          </View>
        )}

        {stage === "quiz" && (
          <View style={styles.quizCard}>
            <Text style={styles.quizMark}>؟</Text>
            {slideQuizReceipt ? (
              <Text style={styles.slideQuizResult}>
                {tr("نتيجة اختبار الشرائح", "Slides quiz score")}: {slideQuizReceipt.scorePercent}%
                {slideQuizReceipt.awardedXp > 0 ? `  •  +${slideQuizReceipt.awardedXp} XP` : ""}
              </Text>
            ) : null}
            <Text style={styles.quizTitle}>
              {data!.lesson.quiz_count > 0 ? tr("جاهز تختبر فهمك؟", "Ready to test your understanding?") : tr("أتممت محتوى الدرس", "Lesson content completed")}
            </Text>
            <Text style={styles.quizCopy}>
              {data!.lesson.quiz_count > 0
                ? `${data!.lesson.quiz_count} أسئلة قصيرة. الإجابة الصحيحة من أول محاولة تمنحك نقاطًا إضافية.`
                : "احفظ تقدّمك وافتح المرحلة التالية من خريطة الكورس."}
            </Text>
            <Action
              title={data!.lesson.quiz_count > 0 ? tr("ابدأ الأسئلة", "Start quiz") : tr("إنهاء الدرس", "Finish lesson")}
              onPress={goToQuiz}
            />
            {slideQuizReceipt && data!.slideDecks.length ? (
              <Pressable
                disabled={savingSlideQuiz}
                onPress={() => {
                  setStage("slides");
                  setSlideError("");
                  setSlideRevision((current) => current + 1);
                }}
                style={styles.retakeQuiz}
              >
                <Text style={styles.retakeQuizText}>{tr("إعادة اختبار الشرائح", "Retake slides quiz")}</Text>
              </Pressable>
            ) : null}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const createStyles = (theme: AppTheme) => ({
  content: { gap: 14, paddingBottom: 118 },
  offline: { backgroundColor: theme.colors.goldLight, color: theme.colors.ink, padding: 10, borderRadius: 10, textAlign: "center" },
  lessonHeader: { backgroundColor: theme.colors.card, borderRadius: 22, borderWidth: 1, borderColor: theme.colors.border, padding: 18, gap: 7 },
  kicker: { color: theme.colors.gold, fontWeight: "900", textAlign: "right" },
  steps: { flexDirection: "row-reverse", justifyContent: "space-between", marginVertical: 8 },
  stepWrap: { flex: 1, alignItems: "center", gap: 5 },
  step: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.card },
  stepActive: { backgroundColor: theme.colors.gold, borderColor: theme.colors.ink, borderWidth: 2 },
  stepText: { color: theme.colors.ink, opacity: 0.55, fontWeight: "900" },
  stepTextActive: { opacity: 1 },
  stepLabel: { color: theme.colors.ink, fontSize: 12, fontWeight: "700" },
  playerCard: { backgroundColor: theme.colors.darkPaper, borderRadius: 22, padding: 10, gap: 10, overflow: "hidden" },
  videoFrame: { height: 230, borderRadius: 15, overflow: "hidden", backgroundColor: "#050505" },
  player: { flex: 1, backgroundColor: "#050505" },
  playerLoading: { ...StyleSheet.absoluteFill, alignItems: "center", justifyContent: "center", gap: 12, backgroundColor: "#0D0D0D" },
  playerLoadingText: { color: "#FFF", opacity: 0.76, fontWeight: "800", textAlign: "center" },
  playerError: { ...StyleSheet.absoluteFill, backgroundColor: "#0D0D0DF2", alignItems: "center", justifyContent: "center", gap: 8, padding: 22 },
  playerErrorTitle: { color: theme.colors.gold, fontWeight: "900", fontSize: 18 },
  playerErrorText: { color: "#FFF", opacity: 0.82, textAlign: "center", lineHeight: 22 },
  retry: { borderColor: theme.colors.gold, borderWidth: 1, borderRadius: 10, minHeight: 42, paddingHorizontal: 18, justifyContent: "center" },
  retryText: { color: theme.colors.gold, fontWeight: "900" },
  playerErrorActions: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 8, flexWrap: "wrap" },
  openYouTube: { backgroundColor: theme.colors.gold, borderRadius: 10, minHeight: 42, paddingHorizontal: 16, justifyContent: "center" },
  openYouTubeText: { color: theme.colors.ink, fontWeight: "900" },
  skipVideo: { minHeight: 40, justifyContent: "center", paddingHorizontal: 8 },
  skipVideoText: { color: "#FFF", textDecorationLine: "underline", opacity: 0.8, fontWeight: "700" },
  controlRail: { minHeight: 50, flexDirection: "row-reverse", alignItems: "center", gap: 8, paddingHorizontal: 2 },
  controlPrimary: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.gold, alignItems: "center", justifyContent: "center" },
  controlPrimaryText: { color: theme.colors.ink, fontWeight: "900", fontSize: 18 },
  control: { minWidth: 48, height: 38, borderRadius: 10, borderWidth: 1, borderColor: "#5C5248", alignItems: "center", justifyContent: "center", paddingHorizontal: 8 },
  controlText: { color: "#FFF", fontWeight: "800", fontSize: 12 },
  controlDisabled: { opacity: 0.42 },
  videoTrack: { flex: 1, height: 5, backgroundColor: "#4B4239", borderRadius: 5, overflow: "hidden" },
  videoFill: { height: "100%", backgroundColor: theme.colors.gold },
  videoPercent: { color: "#FFF", fontSize: 11, minWidth: 28 },
  qualityHint: { color: "#FFF", opacity: 0.58, textAlign: "right", fontSize: 11, lineHeight: 17 },
  slidesCard: { backgroundColor: theme.colors.card, borderRadius: 24, borderWidth: 1, borderColor: theme.colors.border, padding: 12, gap: 12, overflow: "hidden" },
  slidesHeading: { minHeight: 48, flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", gap: 12 },
  deckCounter: { color: theme.colors.gold, textAlign: "right", fontWeight: "800", fontSize: 11, marginBottom: 2 },
  sectionTitle: { color: theme.colors.ink, textAlign: "right", fontWeight: "900", fontSize: 17 },
  slideReload: { minHeight: 38, minWidth: 66, borderRadius: 12, borderWidth: 1, borderColor: `${theme.colors.ink}3A`, alignItems: "center", justifyContent: "center", paddingHorizontal: 10 },
  slideReloadText: { color: theme.colors.ink, fontWeight: "800", fontSize: 12 },
  deckTabs: { flexDirection: "row-reverse", gap: 8, paddingVertical: 2 },
  deckTab: { maxWidth: 180, minHeight: 38, justifyContent: "center", borderRadius: 12, borderWidth: 1, borderColor: `${theme.colors.ink}25`, backgroundColor: theme.colors.paperAlt, paddingHorizontal: 12 },
  deckTabActive: { backgroundColor: theme.colors.ink, borderColor: theme.colors.ink },
  deckTabText: { color: theme.colors.ink, fontWeight: "700", fontSize: 12, textAlign: "right" },
  deckTabTextActive: { color: theme.colors.gold },
  slidesViewport: { position: "relative", borderRadius: 16, overflow: "hidden", backgroundColor: "#090909", borderWidth: 1, borderColor: `${theme.colors.ink}2A` },
  slides: { flex: 1, backgroundColor: "#090909" },
  slideOverlay: { ...StyleSheet.absoluteFill, alignItems: "center", justifyContent: "center", gap: 10, padding: 22, backgroundColor: "#11100FF2" },
  slideOverlayText: { color: "#FFF", opacity: 0.78, fontWeight: "700", lineHeight: 21, textAlign: "center" },
  slideErrorTitle: { color: theme.colors.gold, fontWeight: "900", fontSize: 18, textAlign: "center" },
  deckNavigation: { flexDirection: "row-reverse", justifyContent: "space-between", gap: 10 },
  deckNavButton: { flex: 1, minHeight: 42, alignItems: "center", justifyContent: "center", borderRadius: 12, borderWidth: 1, borderColor: `${theme.colors.ink}35`, backgroundColor: theme.colors.paperAlt },
  deckNavDisabled: { opacity: 0.35 },
  deckNavText: { color: theme.colors.ink, fontWeight: "900" },
  slideProgress: { color: theme.colors.gold, fontWeight: "800", textAlign: "right" },
  slideQuizResult: { color: theme.colors.success, fontWeight: "900", textAlign: "center", fontSize: 16 },
  retakeQuiz: { minHeight: 46, alignItems: "center", justifyContent: "center", borderRadius: 13, borderWidth: 1, borderColor: theme.colors.gold },
  retakeQuizText: { color: theme.colors.gold, fontWeight: "900" },
  quizCard: { backgroundColor: theme.colors.card, borderRadius: 24, borderWidth: 2, borderColor: theme.colors.gold, padding: 24, alignItems: "center", gap: 12 },
  quizMark: { width: 58, height: 58, lineHeight: 58, textAlign: "center", borderRadius: 29, backgroundColor: theme.colors.ink, color: theme.colors.gold, fontSize: 30, fontWeight: "900" },
  quizTitle: { color: theme.colors.ink, fontSize: 23, fontWeight: "900", textAlign: "center" },
  quizCopy: { color: theme.colors.ink, opacity: 0.68, textAlign: "center", lineHeight: 22 },
});
