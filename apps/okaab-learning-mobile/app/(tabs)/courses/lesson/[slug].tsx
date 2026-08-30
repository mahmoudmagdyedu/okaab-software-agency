import { useAuth } from "@clerk/expo";
import NetInfo from "@react-native-community/netinfo";
import { createBridgeScript, createYouTubePlayerHtml } from "@okaab/bridge";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";

import { apiRequest, enqueueEvent, flushEvents } from "@/api";
import { Action, ErrorState, Loading, Muted, Screen, Title } from "@/components";
import { theme } from "@/theme";

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
  slideDecks: { id: string; title: string }[];
  progress: LessonProgress;
};
type Stage = "video" | "slides" | "quiz";

export default function LessonScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const playerRef = useRef<WebView>(null);
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

  const load = useCallback(async () => {
    try {
      const next = await apiRequest<Result>(`/lessons/${encodeURIComponent(slug)}`, getToken);
      setData(next);
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

  const videoHtml = useMemo(
    () =>
      data?.videos[0]
        ? createYouTubePlayerHtml(data.videos[0].youtube_video_id, { origin: "https://okaab.org" })
        : null,
    [data?.videos],
  );

  if (!isLoaded) return <Loading />;
  if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />;
  if (!data && !error) return <Loading />;
  if (error && !data)
    return (
      <Screen>
        <ErrorState message={error} retry={load} />
      </Screen>
    );

  const sendProgress = async (event: Record<string, unknown>) => {
    const payload = {
      ...event,
      idempotencyKey:
        typeof event.idempotencyKey === "string"
          ? event.idempotencyKey
          : `mobile-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    };
    if (online) {
      await apiRequest(`/lessons/${encodeURIComponent(slug)}/events`, getToken, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    } else {
      await enqueueEvent(slug, payload);
    }
  };

  const handleMessage = async (raw: string) => {
    try {
      const event = JSON.parse(raw) as Record<string, unknown>;
      const type = String(event.type || "");
      if (type === "player_ready") {
        setPlayerError("");
        return;
      }
      if (type === "player_state") {
        setPlaying(Number(event.state) === 1);
        return;
      }
      if (type === "player_error") {
        const code = String(event.code ?? "");
        setPlayerError(
          code === "100"
            ? "الفيديو حُذف أو أصبح خاصًا."
            : ["101", "150"].includes(code)
              ? "طلب YouTube تسجيل الدخول للتحقق من الجهاز. افتح الفيديو في YouTube مرة ثم أعد المحاولة."
            : code === "153"
              ? "تعذّر إرسال هوية تطبيق عُقاب إلى YouTube. أعد المحاولة بعد تحديث الاتصال."
              : "تعذّر تشغيل الفيديو الآن. تحقّق من الإنترنت ثم أعد المحاولة.",
        );
        return;
      }
      if (type === "video_finished") {
        setVideoPercent(100);
        setStage(data!.slideDecks.length ? "slides" : "quiz");
        return;
      }
      if (type === "video_progress") {
        const percent = Math.max(0, Math.min(100, Number(event.percent) || 0));
        setVideoPercent((current) => Math.max(current, percent));
        await sendProgress(event);
        return;
      }
      if (type === "slide_changed") {
        const index = Math.max(0, Number(event.index) || 0);
        setLastSlide((current) => Math.max(current, index));
        await sendProgress(event);
      }
    } catch {
      // Ignore malformed messages from third-party iframe contents.
    }
  };

  const playerCommand = (command: string, value?: number) => {
    playerRef.current?.postMessage(JSON.stringify({ source: "okaab-player", command, value }));
  };
  const requiredSlide = Number(data!.lesson.required_slide_index ?? 1);
  const slidesReady = !data!.slideDecks.length || lastSlide >= requiredSlide;
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
          <Text style={styles.offline}>أنت غير متصل — سيُرسل تقدّمك تلقائيًا عند عودة الإنترنت.</Text>
        )}
        <Text style={styles.kicker}>درس تفاعلي</Text>
        <Title>{data!.lesson.title}</Title>
        <Muted>{data!.lesson.description || "شاهد، طبّق، ثم اختبر فهمك لفتح المرحلة التالية."}</Muted>

        <View style={styles.steps}>
          {(["video", "slides", "quiz"] as Stage[]).map((item, index) => (
            <View key={item} style={styles.stepWrap}>
              <View style={[styles.step, stage === item && styles.stepActive]}>
                <Text style={[styles.stepText, stage === item && styles.stepTextActive]}>
                  {index + 1}
                </Text>
              </View>
              <Text style={styles.stepLabel}>
                {item === "video" ? "الفيديو" : item === "slides" ? "الشرح" : "الأسئلة"}
              </Text>
            </View>
          ))}
        </View>

        {stage === "video" && videoHtml && (
          <View style={styles.playerCard}>
            <View style={styles.videoFrame}>
              <WebView
                ref={playerRef}
                source={{ html: videoHtml, baseUrl: "https://okaab.org" }}
                style={styles.player}
                javaScriptEnabled
                domStorageEnabled
                allowsFullscreenVideo
                allowsInlineMediaPlayback
                mediaPlaybackRequiresUserAction={false}
                originWhitelist={["https://*", "about:blank"]}
                onMessage={(event) => void handleMessage(event.nativeEvent.data)}
              />
              {playerError ? (
                <View style={styles.playerError}>
                  <Text style={styles.playerErrorTitle}>الفيديو لم يبدأ</Text>
                  <Text style={styles.playerErrorText}>{playerError}</Text>
                  <Pressable onPress={() => void load()} style={styles.retry}>
                    <Text style={styles.retryText}>إعادة المحاولة</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
            <View style={styles.controlRail}>
              <Pressable
                accessibilityLabel={playing ? "إيقاف مؤقت" : "تشغيل"}
                onPress={() => playerCommand(playing ? "pause" : "play")}
                style={styles.controlPrimary}
              >
                <Text style={styles.controlPrimaryText}>{playing ? "Ⅱ" : "▶"}</Text>
              </Pressable>
              <Pressable
                accessibilityLabel={muted ? "تشغيل الصوت" : "كتم الصوت"}
                onPress={() => {
                  playerCommand(muted ? "unmute" : "mute");
                  setMuted((value) => !value);
                }}
                style={styles.control}
              >
                <Text style={styles.controlText}>{muted ? "صوت" : "كتم"}</Text>
              </Pressable>
              <Pressable
                accessibilityLabel="تغيير سرعة الفيديو"
                onPress={() => {
                  const speeds = [1, 1.25, 1.5, 2];
                  const next = speeds[(speeds.indexOf(rate) + 1) % speeds.length] ?? 1;
                  setRate(next);
                  playerCommand("rate", next);
                }}
                style={styles.control}
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

        {stage === "slides" && data!.slideDecks[0] && (
          <View style={styles.slidesCard}>
            <Text style={styles.sectionTitle}>{data!.slideDecks[0].title}</Text>
            <WebView
              source={{ uri: `https://okaab.org/slides/${data!.slideDecks[0].id}/index.html` }}
              style={styles.slides}
              javaScriptEnabled
              domStorageEnabled
              allowsFullscreenVideo
              injectedJavaScriptBeforeContentLoaded={createBridgeScript()}
              originWhitelist={["https://*"]}
              onMessage={(event) => void handleMessage(event.nativeEvent.data)}
            />
            <Text style={styles.slideProgress}>
              آخر شريحة محفوظة: {lastSlide + 1}
            </Text>
            <Action
              title={data!.lesson.quiz_count ? "ابدأ أسئلة الدرس" : "إكمال المرحلة"}
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
            <Text style={styles.quizTitle}>
              {data!.lesson.quiz_count > 0 ? "جاهز تختبر فهمك؟" : "أتممت محتوى الدرس"}
            </Text>
            <Text style={styles.quizCopy}>
              {data!.lesson.quiz_count > 0
                ? `${data!.lesson.quiz_count} أسئلة قصيرة. الإجابة الصحيحة من أول محاولة تمنحك نقاطًا إضافية.`
                : "احفظ تقدّمك وافتح المرحلة التالية من خريطة الكورس."}
            </Text>
            <Action
              title={data!.lesson.quiz_count > 0 ? "ابدأ الأسئلة" : "إنهاء الدرس"}
              onPress={goToQuiz}
            />
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: 14, paddingBottom: 118 },
  offline: { backgroundColor: theme.colors.goldLight, color: theme.colors.ink, padding: 10, borderRadius: 10, textAlign: "center" },
  kicker: { color: theme.colors.gold, fontWeight: "900", textAlign: "right" },
  steps: { flexDirection: "row-reverse", justifyContent: "space-between", marginVertical: 8 },
  stepWrap: { flex: 1, alignItems: "center", gap: 5 },
  step: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: `${theme.colors.ink}44`, backgroundColor: theme.colors.card },
  stepActive: { backgroundColor: theme.colors.gold, borderColor: theme.colors.ink, borderWidth: 2 },
  stepText: { color: theme.colors.ink, opacity: 0.55, fontWeight: "900" },
  stepTextActive: { opacity: 1 },
  stepLabel: { color: theme.colors.ink, fontSize: 12, fontWeight: "700" },
  playerCard: { backgroundColor: theme.colors.darkPaper, borderRadius: 22, padding: 10, gap: 10, overflow: "hidden" },
  videoFrame: { height: 230, borderRadius: 15, overflow: "hidden", backgroundColor: "#050505" },
  player: { flex: 1, backgroundColor: "#050505" },
  playerError: { ...StyleSheet.absoluteFill, backgroundColor: "#0D0D0DF2", alignItems: "center", justifyContent: "center", gap: 8, padding: 22 },
  playerErrorTitle: { color: theme.colors.gold, fontWeight: "900", fontSize: 18 },
  playerErrorText: { color: "#FFF", opacity: 0.82, textAlign: "center", lineHeight: 22 },
  retry: { borderColor: theme.colors.gold, borderWidth: 1, borderRadius: 10, minHeight: 42, paddingHorizontal: 18, justifyContent: "center" },
  retryText: { color: theme.colors.gold, fontWeight: "900" },
  controlRail: { minHeight: 50, flexDirection: "row-reverse", alignItems: "center", gap: 8, paddingHorizontal: 2 },
  controlPrimary: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.gold, alignItems: "center", justifyContent: "center" },
  controlPrimaryText: { color: theme.colors.ink, fontWeight: "900", fontSize: 18 },
  control: { minWidth: 48, height: 38, borderRadius: 10, borderWidth: 1, borderColor: "#5C5248", alignItems: "center", justifyContent: "center", paddingHorizontal: 8 },
  controlText: { color: "#FFF", fontWeight: "800", fontSize: 12 },
  videoTrack: { flex: 1, height: 5, backgroundColor: "#4B4239", borderRadius: 5, overflow: "hidden" },
  videoFill: { height: "100%", backgroundColor: theme.colors.gold },
  videoPercent: { color: "#FFF", fontSize: 11, minWidth: 28 },
  qualityHint: { color: "#FFF", opacity: 0.58, textAlign: "right", fontSize: 11, lineHeight: 17 },
  slidesCard: { backgroundColor: theme.colors.card, borderRadius: 22, borderWidth: 1, borderColor: `${theme.colors.ink}24`, padding: 10, gap: 10 },
  sectionTitle: { color: theme.colors.ink, textAlign: "right", fontWeight: "900", fontSize: 17 },
  slides: { height: 430, borderRadius: 14, backgroundColor: "#090909" },
  slideProgress: { color: theme.colors.gold, fontWeight: "800", textAlign: "right" },
  quizCard: { backgroundColor: theme.colors.card, borderRadius: 24, borderWidth: 2, borderColor: theme.colors.gold, padding: 24, alignItems: "center", gap: 12 },
  quizMark: { width: 58, height: 58, lineHeight: 58, textAlign: "center", borderRadius: 29, backgroundColor: theme.colors.ink, color: theme.colors.gold, fontSize: 30, fontWeight: "900" },
  quizTitle: { color: theme.colors.ink, fontSize: 23, fontWeight: "900", textAlign: "center" },
  quizCopy: { color: theme.colors.ink, opacity: 0.68, textAlign: "center", lineHeight: 22 },
});
