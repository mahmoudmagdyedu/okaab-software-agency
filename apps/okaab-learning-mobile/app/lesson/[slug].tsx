import { useAuth } from "@clerk/expo";
import NetInfo from "@react-native-community/netinfo";
import { createBridgeScript, createYouTubePlayerHtml } from "@okaab/bridge";
import { Link, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import { apiRequest, enqueueEvent, flushEvents } from "@/api";
import { ErrorState, Loading, Muted, Screen, Title } from "@/components";
import { theme } from "@/theme";
type Result = {
  lesson: {
    title: string;
    description: string;
    quiz_count: number;
    task_enabled: boolean;
    task_prompt: string | null;
  };
  videos: { youtube_video_id: string }[];
  slideDecks: { id: string; title: string }[];
  progress: unknown;
};
export default function LessonScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { isSignedIn, getToken } = useAuth();
  const [data, setData] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [online, setOnline] = useState(true);
  const load = async () => {
    try {
      setData(
        await apiRequest<Result>(
          `/lessons/${encodeURIComponent(slug)}`,
          isSignedIn ? getToken : undefined,
        ),
      );
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذّر التحميل");
    }
  };
  useEffect(() => {
    void load();
    const off = NetInfo.addEventListener((x) => {
      setOnline(Boolean(x.isConnected));
      if (x.isConnected && isSignedIn) void flushEvents(getToken);
    });
    return off;
  }, [slug, isSignedIn]);
  const source = useMemo(
    () =>
      data?.slideDecks[0]
        ? { uri: `https://okaab.org/slides/${data.slideDecks[0].id}/index.html` }
        : data?.videos[0]
          ? {
              html: createYouTubePlayerHtml(data.videos[0].youtube_video_id),
              baseUrl: "https://okaab.org",
            }
          : null,
    [data],
  );
  if (!data && !error) return <Loading />;
  if (error && !data)
    return (
      <Screen>
        <ErrorState message={error} retry={load} />
      </Screen>
    );
  const onMessage = async (raw: string) => {
    if (!isSignedIn) return;
    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      const event = {
        ...parsed,
        idempotencyKey:
          typeof parsed.idempotencyKey === "string"
            ? parsed.idempotencyKey
            : `mobile-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      };
      if (online)
        await apiRequest(`/lessons/${encodeURIComponent(slug)}/events`, getToken, {
          method: "POST",
          body: JSON.stringify(event),
        });
      else await enqueueEvent(slug, event);
    } catch {
      return;
    }
  };
  return (
    <Screen>
      {!online && (
        <Text style={s.offline}>أنت غير متصل — هنحفظ تقدّمك ونرسله لما الإنترنت يرجع.</Text>
      )}
      <Title>{data!.lesson.title}</Title>
      <Muted>
        {data!.lesson.description || "ركّز في الدرس، وتقدّمك بيتحفظ تلقائيًا بعد تسجيل الدخول."}
      </Muted>
      {source ? (
        <WebView
          source={source}
          style={s.player}
          javaScriptEnabled
          allowsFullscreenVideo
          injectedJavaScriptBeforeContentLoaded={source.uri ? createBridgeScript() : undefined}
          onMessage={(e) => void onMessage(e.nativeEvent.data)}
          originWhitelist={["https://*"]}
        />
      ) : (
        <View style={s.empty}>
          <Muted>محتوى الدرس غير منشور بعد.</Muted>
        </View>
      )}
      {data!.lesson.quiz_count > 0 && (
        <Link href={{ pathname: "/quiz/[slug]", params: { slug } }} asChild>
          <Pressable accessibilityRole="button" style={s.quizButton}>
            <Text style={s.quizButtonText}>ابدأ اختبار الدرس</Text>
          </Pressable>
        </Link>
      )}
      {data!.lesson.task_enabled && (
        <Link href={{ pathname: "/task/[slug]", params: { slug } }} asChild>
          <Pressable accessibilityRole="button" style={s.taskButton}>
            <Text style={s.taskButtonText}>حل المهمة العملية</Text>
          </Pressable>
        </Link>
      )}
    </Screen>
  );
}
const s = StyleSheet.create({
  offline: {
    backgroundColor: theme.colors.goldLight,
    color: theme.colors.ink,
    padding: 10,
    borderRadius: 6,
    textAlign: "center",
    marginBottom: 8,
  },
  player: { flex: 1, marginTop: 12, borderRadius: 10, backgroundColor: theme.colors.darkPaper },
  empty: { flex: 1, alignItems: "center", justifyContent: "center" },
  quizButton: {
    minHeight: 50,
    marginVertical: 12,
    borderRadius: theme.radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.gold,
  },
  quizButtonText: { color: theme.colors.ink, fontWeight: "900", fontSize: 16 },
  taskButton: {
    minHeight: 50,
    marginBottom: 12,
    borderRadius: theme.radius.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: theme.colors.gold,
    backgroundColor: theme.colors.card,
  },
  taskButtonText: { color: theme.colors.ink, fontWeight: "900", fontSize: 16 },
});
