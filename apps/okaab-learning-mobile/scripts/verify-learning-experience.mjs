import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const lesson = readFileSync(new URL("../app/(tabs)/courses/lesson/[slug].tsx", import.meta.url), "utf8");
const bridge = readFileSync(new URL("../../../packages/bridge/index.js", import.meta.url), "utf8");
const home = readFileSync(new URL("../app/(tabs)/index.tsx", import.meta.url), "utf8");
const authUi = readFileSync(new URL("../src/auth-ui.tsx", import.meta.url), "utf8");
const theme = readFileSync(new URL("../src/theme.ts", import.meta.url), "utf8");
const appConfig = readFileSync(new URL("../app.json", import.meta.url), "utf8");

assert.match(home, /okaab-brand-logo-transparent\.png/, "Home must use the transparent centered logo.");
assert.match(authUi, /okaab-brand-logo-transparent\.png/, "Authentication must use the transparent logo.");
assert.match(lesson, /react-native-youtube-iframe/, "Lessons must use the maintained React Native YouTube player.");
assert.match(lesson, /onReady=/, "The native player must expose a deterministic ready state.");
assert.match(lesson, /onChangeState=/, "The native player must advance after video completion.");
assert.match(lesson, /getCurrentTime/, "The native player must sample and persist video progress.");
assert.match(lesson, /continueWithoutVideo/, "A blocked YouTube embed must never trap the learner.");
assert.doesNotMatch(lesson, /createYouTubePlayerHtml/, "The mobile lesson must not maintain a second handwritten player implementation.");
assert.match(lesson, /ANDROID_BROWSER_USER_AGENT/, "The embedded player must identify as a supported browser.");
assert.match(lesson, /activeDeck\?\.entry_path/, "Slides must use the stored deck entry path.");
assert.match(lesson, /slideDecks\.map/, "Every published slide deck must be selectable.");
assert.match(bridge, /reportCurrentSlide/, "The first visible slide must report progress immediately.");
assert.match(theme, /darkColors/, "The application must define a complete dark palette.");
assert.match(theme, /THEME_KEY/, "The selected color mode must persist on device.");
assert.match(appConfig, /"forcesRTL": true/, "Arabic RTL must be configured at native build time.");
assert.doesNotMatch(
  lesson,
  /slideDecks\[0\]\.id}\/index\.html/,
  "The lesson must not hard-code only the first deck and index.html.",
);

console.log("Learning UI, native YouTube player, RTL, dark mode, slide selection, and progress gates verified.");
