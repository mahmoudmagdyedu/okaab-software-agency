import { useAuth, useSessionList } from "@clerk/expo";
import { Redirect, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { EagleLoader } from "@/components";
import { theme } from "@/theme";

export default function AuthLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const sessionList = useSessionList();
  const [pendingCleanupFinished, setPendingCleanupFinished] = useState(false);

  useEffect(() => {
    if (!isLoaded || !sessionList.isLoaded) return;
    if (isSignedIn) {
      setPendingCleanupFinished(true);
      return;
    }

    const pendingSessions = sessionList.sessions.filter((session) => session.status === "pending");
    if (!pendingSessions.length) {
      setPendingCleanupFinished(true);
      return;
    }

    let cancelled = false;
    void Promise.allSettled(pendingSessions.map((session) => session.remove()))
      .finally(() => {
        if (!cancelled) setPendingCleanupFinished(true);
      });

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, sessionList.isLoaded, sessionList.sessions]);

  if (!isLoaded || !sessionList.isLoaded || !pendingCleanupFinished) return <EagleLoader label="نراجع جلسة الدخول بأمان…" />;
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
