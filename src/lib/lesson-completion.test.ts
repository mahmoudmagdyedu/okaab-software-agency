import assert from "node:assert/strict";
import test from "node:test";

import { lessonCompletion, type LessonCompletionFacts } from "./lesson-completion.ts";

const completeFacts: LessonCompletionFacts = {
  status: "in_progress",
  videoCount: 1,
  videoPercent: 85,
  slideDeckCount: 2,
  lastSlide: 22,
  requiredSlideIndex: 1,
  quizQuestionCount: 0,
  correctQuizQuestionCount: 0,
  embeddedQuizCount: 2,
  completedEmbeddedQuizCount: 2,
  taskEnabled: false,
  taskPassed: false,
};

test("requires 85 percent video progress and every configured learning gate", () => {
  const blocked = lessonCompletion({ ...completeFacts, videoPercent: 84 });
  assert.equal(blocked.eligible, false);
  assert.deepEqual(blocked.missing, ["video"]);
  assert.equal(blocked.requirements.video.minimumPercent, 85);

  const complete = lessonCompletion(completeFacts);
  assert.equal(complete.eligible, true);
  assert.deepEqual(complete.missing, []);
});

test("reports each missing requirement in a stable machine-readable order", () => {
  const result = lessonCompletion({
    ...completeFacts,
    videoPercent: 10,
    lastSlide: 0,
    completedEmbeddedQuizCount: 1,
    taskEnabled: true,
    taskPassed: false,
  });
  assert.deepEqual(result.missing, ["video", "slides", "quiz", "task"]);
});
