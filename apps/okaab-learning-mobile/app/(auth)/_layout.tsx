import { useAuth } from "@clerk/expo";
import { Redirect, Stack } from "expo-router";
import { StyleSheet, View } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { Loading } from "@/components";
import { theme } from "@/theme";

export default function AuthLayout() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return <Loading />;
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
        <VideoView
          player={player}
          style={styles.video}
          nativeControls={false}
          contentFit="cover"
        />
        <View style={styles.overlay} />
        <View style={styles.scrim} />
      </View>
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
  video: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#F6F1E7",
    opacity: 0.42,
  },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(16, 14, 11, 0.22)" },
});
