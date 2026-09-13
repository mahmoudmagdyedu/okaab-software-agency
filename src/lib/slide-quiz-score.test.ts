import assert from "node:assert/strict";
import test from "node:test";

import { slideQuizAward, slideQuizOutcome } from "./slide-quiz-score.ts";

test("awards XP only for answers above the previous best", () => {
  assert.deepEqual(slideQuizAward(8, 5, 10), { gainedAnswers: 3, awardedXp: 30 });
  assert.deepEqual(slideQuizAward(8, 8, 10), { gainedAnswers: 0, awardedXp: 0 });
  assert.deepEqual(slideQuizAward(6, 8, 10), { gainedAnswers: 0, awardedXp: 0 });
});

test("rejects invalid scoring values", () => {
  assert.throws(() => slideQuizAward(-1, 0, 10), RangeError);
  assert.throws(() => slideQuizAward(1.5, 0, 10), TypeError);
});

test("keeps one non-decreasing best score and only rewards improvement", () => {
  assert.deepEqual(
    slideQuizOutcome({
      scorePercent: 60,
      correctAnswers: 6,
      previousBestScorePercent: 80,
      previousBestCorrectAnswers: 8,
      pointsPerAnswer: 10,
    }),
    { bestScorePercent: 80, improved: false, awardedXp: 0 },
  );
  assert.deepEqual(
    slideQuizOutcome({
      scorePercent: 80,
      correctAnswers: 8,
      previousBestScorePercent: 80,
      previousBestCorrectAnswers: 8,
      pointsPerAnswer: 10,
    }),
    { bestScorePercent: 80, improved: false, awardedXp: 0 },
  );
  assert.deepEqual(
    slideQuizOutcome({
      scorePercent: 100,
      correctAnswers: 10,
      previousBestScorePercent: 80,
      previousBestCorrectAnswers: 8,
      pointsPerAnswer: 10,
    }),
    { bestScorePercent: 100, improved: true, awardedXp: 20 },
  );
});
