import { useAuth, useSessionList } from "@clerk/expo";
import { Redirect, Stack, router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { EagleLoader } from "@/components";
import { theme } from "@/theme";

export default function AuthLayout() {
  const { isLoaded, isSignedIn, sessionId } = useAuth({ treatPendingAsSignedOut: false });
  const sessionList = useSessionList();
  const [activatingPending, setActivatingPending] = useState(false);
  const attemptedPendingSession = useRef<string | null>(null);
  const activeSession = sessionList.isLoaded
    ? sessionList.sessions.find((session) => session.id === sessionId)
    : undefined;
  const pendingSession = sessionList.isLoaded
    ? sessionList.sessions.find((session) => session.status === "pending")
    : undefined;

  useEffect(() => {
    if (!isLoaded || !sessionList.isLoaded) return;
    if (
      isSignedIn
      || !pendingSession
      || activatingPending
      || attemptedPendingSession.current === pendingSession.id
    ) return;
    attemptedPendingSession.current = pendingSession.id;
    setActivatingPending(true);
    void sessionList.setActive({
      session: pendingSession.id,
      navigate: ({ session }) => {
        router.replace(session.currentTask ? "/session-task" : "/(tabs)");
      },
    })
      .catch(() => router.replace("/session-task"))
      .finally(() => setActivatingPending(false));
  }, [activatingPending, isLoaded, isSignedIn, pendingSession, sessionList]);

  if (!isLoaded || !sessionList.isLoaded || activatingPending) return <EagleLoader label="نراجع جلسة الدخول بأمان…" />;
  if (isSignedIn && activeSession?.status === "pending") return <Redirect href="/session-task" />;
  if (isSignedIn) return <Redirect href="/(tabs)" />;

  return <AuthBackdrop />;
}

function AuthBackdrop() {
  const player = useVideoPlayer(require("../../assets/auth-background.mp4"), (videoPlayer) => {
    videoPlayer.loop = true;
    videoPlayer.muted = true;
    videoPlayer.play();
  });

  return (
    <View style={styles.container}>
      <View style={styles.videoContainer}>
        <Image
          source={require("../../assets/auth-background-poster.jpg")}
          resizeMode="cover"
          style={styles.poster}
        />
        <VideoView
          player={player}
          style={styles.video}
          nativeControls={false}
          contentFit="cover"
        />
        <View style={styles.overlay} />
        <LinearGradient
          colors={["rgba(16,14,11,.10)", "rgba(16,14,11,.34)", "rgba(16,14,11,.78)"]}
          locations={[0, 0.48, 1]}
          style={styles.scrim}
        />
      </View>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
          gestureEnabled: false,
          contentStyle: { backgroundColor: "transparent", direction: "rtl" },
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.paper || "#F6F1E7",
  },
  videoContainer: {
    ...StyleSheet.absoluteFill,
  },
  poster: { ...StyleSheet.absoluteFill, width: "100%", height: "100%" },
  video: {
    ...StyleSheet.absoluteFill,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#F6F1E7",
    opacity: 0.3,
  },
  scrim: { ...StyleSheet.absoluteFill },
});
