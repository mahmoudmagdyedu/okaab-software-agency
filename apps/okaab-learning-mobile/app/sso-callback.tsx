import { Redirect } from "expo-router";
import { useAuth } from "@clerk/expo";
import { useEffect, useState } from "react";

import { EagleLoader } from "@/components";

export default function SsoCallbackScreen() {
  const { isLoaded, isSignedIn } = useAuth();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!isLoaded || isSignedIn) return;
    const timeout = setTimeout(() => setTimedOut(true), 12_000);
    return () => clearTimeout(timeout);
  }, [isLoaded, isSignedIn]);

  if (isLoaded && isSignedIn) return <Redirect href="/(tabs)" />;
  if (timedOut) return <Redirect href="/(auth)/sign-in?sso=timeout" />;
  return <EagleLoader label="بنكمل تسجيل الدخول الآمن…" />;
}
