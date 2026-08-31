import { router } from "expo-router";

type AuthenticationSession = { currentTask?: { key: string } };

export function navigateAfterAuthentication({ session }: { session: AuthenticationSession }) {
  router.replace(session.currentTask ? "/session-task" : "/(tabs)");
}
