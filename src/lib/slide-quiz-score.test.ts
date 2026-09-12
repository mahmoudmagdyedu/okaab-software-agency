import assert from "node:assert/strict";
import test from "node:test";

import { slideQuizAward } from "./slide-quiz-score.ts";

test("awards XP only for answers above the previous best", () => {
  assert.deepEqual(slideQuizAward(8, 5, 10), { gainedAnswers: 3, awardedXp: 30 });
  assert.deepEqual(slideQuizAward(8, 8, 10), { gainedAnswers: 0, awardedXp: 0 });
  assert.deepEqual(slideQuizAward(6, 8, 10), { gainedAnswers: 0, awardedXp: 0 });
});

test("rejects invalid scoring values", () => {
  assert.throws(() => slideQuizAward(-1, 0, 10), RangeError);
  assert.throws(() => slideQuizAward(1.5, 0, 10), TypeError);
});
