import { Redirect } from "expo-router";
import { useAuth } from "@clerk/expo";

import { EagleLoader } from "@/components";

export default function SsoCallbackScreen() {
  const { isLoaded, isSignedIn } = useAuth({ treatPendingAsSignedOut: false });

  if (!isLoaded) return <EagleLoader label="بنكمل تسجيل الدخول الآمن…" />;
  return <Redirect href={isSignedIn ? "/(tabs)" : "/(auth)/sign-in"} />;
}
