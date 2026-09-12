import assert from "node:assert/strict";
import test from "node:test";
import vm from "node:vm";

import { createBridgeScript } from "./index.js";

test("reports results from legacy UQ_TEST slide quizzes", () => {
  const messages = [];
  let intervalCallback = null;
  const listeners = new Map();
  const window = {
    UQ_TEST: {
      questions: Array.from({ length: 10 }),
      getState: () => ({ done: true, score: 8 }),
    },
    addEventListener: (name, callback) => listeners.set(name, callback),
    clearInterval: () => {},
    location: { origin: "https://okaab.org" },
    parent: { postMessage: (message) => messages.push(message) },
    setInterval: (callback) => {
      intervalCallback = callback;
      return 1;
    },
    setTimeout: () => {},
  };
  vm.runInNewContext(createBridgeScript(), { window });
  assert.ok(intervalCallback);
  intervalCallback();
  intervalCallback();
  assert.equal(messages.length, 1);
  assert.equal(messages[0].source, "okaab-lesson");
  assert.deepEqual(JSON.parse(JSON.stringify(messages[0].event)), {
    type: "quiz_finished",
    correctAnswers: 8,
    totalQuestions: 10,
    scorePercent: 80,
    idempotencyKey: messages[0].event.idempotencyKey,
  });
});
