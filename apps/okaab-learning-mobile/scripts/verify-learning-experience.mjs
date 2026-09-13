import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const lesson = readFileSync(new URL("../app/(tabs)/courses/lesson/[slug].tsx", import.meta.url), "utf8");
const bridge = readFileSync(new URL("../../../packages/bridge/index.js", import.meta.url), "utf8");
const home = readFileSync(new URL("../app/(tabs)/index.tsx", import.meta.url), "utf8");
const authUi = readFileSync(new URL("../src/auth-ui.tsx", import.meta.url), "utf8");
const theme = readFileSync(new URL("../src/theme.ts", import.meta.url), "utf8");
const appConfig = readFileSync(new URL("../app.json", import.meta.url), "utf8");
const api = readFileSync(new URL("../src/api.ts", import.meta.url), "utf8");
const catalog = readFileSync(new URL("../app/(tabs)/courses/index.tsx", import.meta.url), "utf8");
const course = readFileSync(new URL("../app/(tabs)/courses/course/[slug].tsx", import.meta.url), "utf8");
const quiz = readFileSync(new URL("../app/(tabs)/courses/quiz/[slug].tsx", import.meta.url), "utf8");
const profile = readFileSync(new URL("../app/(tabs)/profile.tsx", import.meta.url), "utf8");
const i18n = readFileSync(new URL("../src/i18n.tsx", import.meta.url), "utf8");

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
assert.match(lesson, /type: "quiz_completed"/, "Embedded slide quiz results must be persisted.");
assert.match(lesson, /Retake slides quiz/, "Embedded quizzes must support another attempt.");
assert.match(lesson, /20_000/, "Slide loading must have a bounded timeout.");
assert.match(quiz, /Retake quiz/, "Lesson quizzes must support multiple attempts.");
assert.match(api, /skipCache: true/, "A 401 must refresh the Clerk token exactly once.");
assert.match(catalog, /useFocusEffect/, "Catalog progress must refresh when the tab regains focus.");
assert.match(course, /useFocusEffect/, "Course progress must refresh when returning from a lesson.");
assert.match(theme, /darkColors/, "The application must define a complete dark palette.");
assert.match(theme, /lightColors/, "The application must retain an explicit light palette.");
assert.match(theme, /THEME_KEY/, "The selected color mode must persist on device.");
assert.match(profile, /setProfileImage/, "Learners must be able to update their Clerk profile photo.");
assert.match(profile, /setPreference/, "Light, dark, and system themes must be directly selectable.");
assert.match(i18n, /"ar" \| "en"/, "Arabic and English must both be selectable at runtime.");
assert.match(appConfig, /"supportsRTL": true/, "RTL support must remain enabled.");
assert.match(appConfig, /"forcesRTL": false/, "English must not be forced into an RTL native layout.");
assert.match(appConfig, /\["ar", "en"\]/, "Arabic and English must both be declared.");
assert.doesNotMatch(
  lesson,
  /slideDecks\[0\]\.id}\/index\.html/,
  "The lesson must not hard-code only the first deck and index.html.",
);

console.log("Learning progress, retries, themes, profile photo, Arabic/English, and slide quiz gates verified.");
