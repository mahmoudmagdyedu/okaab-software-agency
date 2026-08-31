import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const lesson = readFileSync(new URL("../app/(tabs)/courses/lesson/[slug].tsx", import.meta.url), "utf8");
const bridge = readFileSync(new URL("../../../packages/bridge/index.js", import.meta.url), "utf8");
const home = readFileSync(new URL("../app/(tabs)/index.tsx", import.meta.url), "utf8");
const authUi = readFileSync(new URL("../src/auth-ui.tsx", import.meta.url), "utf8");

assert.match(home, /okaab-brand-logo-transparent\.png/, "Home must use the transparent centered logo.");
assert.match(authUi, /okaab-brand-logo-transparent\.png/, "Authentication must use the transparent logo.");
assert.match(bridge, /youtube-nocookie\.com/, "The player must try YouTube's privacy-enhanced host.");
assert.match(lesson, /setPrivacyEnhanced\(false\)/, "The player must retry on the standard YouTube host.");
assert.match(lesson, /ANDROID_BROWSER_USER_AGENT/, "The embedded player must identify as a supported browser.");
assert.match(lesson, /activeDeck\?\.entry_path/, "Slides must use the stored deck entry path.");
assert.match(lesson, /slideDecks\.map/, "Every published slide deck must be selectable.");
assert.match(bridge, /reportCurrentSlide/, "The first visible slide must report progress immediately.");
assert.doesNotMatch(
  lesson,
  /slideDecks\[0\]\.id}\/index\.html/,
  "The lesson must not hard-code only the first deck and index.html.",
);

console.log("Learning UI, YouTube fallback, slide selection, and progress gates verified.");
