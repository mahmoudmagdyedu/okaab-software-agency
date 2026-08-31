import { useAuth, useClerk, useSessionList, useSignIn, useSignUp } from "@clerk/expo";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";

import { navigateAfterAuthentication } from "@/auth-session";
import { EagleLoader } from "@/components";

export default function SsoCallbackScreen() {
  const clerk = useClerk();
  const { isLoaded, isSignedIn, sessionId } = useAuth({ treatPendingAsSignedOut: false });
  const sessionList = useSessionList();
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const handled = useRef(false);
  const [failed, setFailed] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!isLoaded || isSignedIn || failed) return;
    const timeout = setTimeout(() => setTimedOut(true), 25_000);
    return () => clearTimeout(timeout);
  }, [failed, isLoaded, isSignedIn]);

  useEffect(() => {
    if (!clerk.loaded || !sessionList.isLoaded || handled.current) return;
    handled.current = true;

    const finish = async () => {
      try {
        if ((signIn.status as string) === "complete") {
          await signIn.finalize({ navigate: navigateAfterAuthentication });
          return;
        }

        if (signUp.isTransferable) {
          const transfer = await signIn.create({ transfer: true });
          if (transfer.error) throw transfer.error;
          if (signIn.status === "complete") {
            await signIn.finalize({ navigate: navigateAfterAuthentication });
            return;
          }
          router.replace("/(auth)/sign-in?resume=1");
          return;
        }

        if (
          signIn.status === "needs_first_factor"
          && !signIn.supportedFirstFactors.every((factor) => factor.strategy === "enterprise_sso")
        ) {
          router.replace("/(auth)/sign-in?resume=1");
          return;
        }

        if (signIn.isTransferable) {
          const transfer = await signUp.create({ transfer: true });
          if (transfer.error) throw transfer.error;
          if (signUp.status === "complete") {
            await signUp.finalize({ navigate: navigateAfterAuthentication });
            return;
          }
          router.replace("/(auth)/sign-up");
          return;
        }

        if (signUp.status === "complete") {
          await signUp.finalize({ navigate: navigateAfterAuthentication });
          return;
        }

        if (
          signIn.status === "needs_second_factor"
          || signIn.status === "needs_client_trust"
          || signIn.status === "needs_new_password"
        ) {
          router.replace("/(auth)/sign-in?resume=1");
          return;
        }

        const existingSessionId = signIn.existingSession?.sessionId || signUp.existingSession?.sessionId;
        if (existingSessionId) {
          await clerk.setActive({ session: existingSessionId, navigate: navigateAfterAuthentication });
          return;
        }

        const pendingSession = sessionList.sessions.find((session) => session.status === "pending");
        if (pendingSession) {
          await sessionList.setActive({ session: pendingSession.id, navigate: navigateAfterAuthentication });
          return;
        }

        handled.current = false;
      } catch {
        setFailed(true);
      }
    };

    void finish();
  }, [clerk, sessionList, signIn, signUp]);

  useEffect(() => {
    if (!isSignedIn || !sessionList.isLoaded || !sessionId) return;
    const session = sessionList.sessions.find((item) => item.id === sessionId);
    if (session) navigateAfterAuthentication({ session });
  }, [isSignedIn, sessionId, sessionList]);

  useEffect(() => {
    if (failed || timedOut) router.replace("/(auth)/sign-in?sso=timeout");
  }, [failed, timedOut]);

  return (
    <View style={styles.screen}>
      <View nativeID="clerk-captcha" />
      <EagleLoader label="بنكمل تسجيل الدخول الآمن…" />
    </View>
  );
}

const styles = StyleSheet.create({ screen: { flex: 1 } });
