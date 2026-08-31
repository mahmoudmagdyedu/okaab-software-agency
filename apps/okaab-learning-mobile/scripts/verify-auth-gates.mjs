import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFileSync(resolve(root, path), "utf8");
const authLayout = read("app/(auth)/_layout.tsx");
const tabsLayout = read("app/(tabs)/_layout.tsx");
const signIn = read("app/(auth)/sign-in.tsx");
const signUp = read("app/(auth)/sign-up.tsx");
const home = read("app/(tabs)/index.tsx");
const components = read("src/components.tsx");
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
  authLayout.includes('session.status === "pending"') && authLayout.includes("session.remove()"),
  "The auth layout must clear stale pending sessions before showing the form.",
);
verify(
  !signIn.includes("activateExistingSession") && !signUp.includes("activateExistingSession"),
  "Authentication must finalize verified attempts instead of reviving arbitrary sessions.",
);
verify(
  home.includes("okaab-brand-logo.png"),
  "The home screen must use the supplied Okaab PNG brand logo.",
);
verify(
  !components.includes("skeletonMiniLogo") && components.includes("<FlyingEagleLogo"),
  "The animated SVG must remain limited to the dedicated loading component.",
);

console.log("Auth gates, session cleanup, and logo separation verified.");
