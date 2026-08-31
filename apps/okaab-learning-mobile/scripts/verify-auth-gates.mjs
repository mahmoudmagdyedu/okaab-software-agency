import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFileSync(resolve(root, path), "utf8");
const authLayout = read("app/(auth)/_layout.tsx");
const tabsLayout = read("app/(tabs)/_layout.tsx");
const signIn = read("app/(auth)/sign-in.tsx");
const signUp = read("app/(auth)/sign-up.tsx");
const ssoCallback = read("app/sso-callback.tsx");
const sessionTask = read("app/session-task.tsx");
const authSession = read("src/auth-session.ts");
const home = read("app/(tabs)/index.tsx");
const components = read("src/components.tsx");
const authUi = read("src/auth-ui.tsx");
const protectedSources = [
  tabsLayout,
  read("app/(tabs)/achievements.tsx"),
  read("app/(tabs)/profile.tsx"),
  read("app/(tabs)/courses/index.tsx"),
  read("app/(tabs)/courses/course/[slug].tsx"),
  read("app/(tabs)/courses/lesson/[slug].tsx"),
  read("app/(tabs)/courses/quiz/[slug].tsx"),
  read("app/(tabs)/courses/task/[slug].tsx"),
];

function verify(condition, message) {
  if (!condition) throw new Error(message);
}

verify(
  protectedSources.every((source) => !source.includes("treatPendingAsSignedOut: false")),
  "Protected routes must never treat a pending Clerk session as signed in.",
);
verify(
  authLayout.includes('session.status === "pending"')
    && authLayout.includes("sessionList.setActive")
    && !authLayout.includes("session.remove()"),
  "Pending Clerk sessions must be resumed and never deleted by the auth layout.",
);
verify(
  !signIn.includes("activateExistingSession") && !signUp.includes("activateExistingSession"),
  "Authentication must finalize verified attempts instead of reviving arbitrary sessions.",
);
verify(
  signIn.includes("navigate: navigateAfterAuthentication")
    && signUp.includes("navigate: navigateAfterAuthentication"),
  "Google SSO must explicitly activate only the session returned by Clerk.",
);
verify(
  ssoCallback.includes("signIn.isTransferable")
    && ssoCallback.includes("signUp.create({ transfer: true })")
    && ssoCallback.includes('nativeID="clerk-captcha"'),
  "The SSO callback must complete Clerk transfer flows and host CAPTCHA.",
);
verify(
  signIn.includes('nativeID="clerk-captcha"') && signUp.includes('nativeID="clerk-captcha"'),
  "Every screen that can create an account through Google must host Clerk CAPTCHA.",
);
verify(
  authSession.includes('session.currentTask ? "/session-task" : "/(tabs)"')
    && sessionTask.includes('task === "choose-organization"')
    && sessionTask.includes('task === "reset-password"')
    && sessionTask.includes('task === "setup-mfa"'),
  "Pending session tasks must route to a supported completion screen.",
);
verify(
  signIn.includes('signIn.status === "needs_second_factor"')
    && signIn.includes("signIn.mfa.verifyEmailCode")
    && signIn.includes("signIn.mfa.verifyTOTP"),
  "Email sign-in must complete configured second-factor checks.",
);
verify(
  home.includes("okaab-brand-logo-transparent.png"),
  "The home screen must use the transparent Okaab PNG brand logo.",
);
verify(
  !components.includes("compactEagle")
    && !authUi.includes("EagleLoader")
    && components.match(/<FlyingEagleLogo/g)?.length === 1,
  "The animated SVG must remain limited to the full-screen loading component.",
);

console.log("Auth gates, Google transfer, pending tasks, MFA, and logo separation verified.");
