import assert from "node:assert/strict";
import test from "node:test";

import { lessonTaskSaveSchema, questionSaveSchema } from "./question-bank-validation.ts";

const validQuestion = {
  lessonId: "lesson-1",
  text: "What is a closure?",
  level: "medium" as const,
  sortOrder: 0,
  published: true,
  options: [
    { text: "A function with lexical scope", explanation: "Correct.", correct: true },
    { text: "A database table", explanation: "Not related.", correct: false },
  ],
};

test("question bank accepts a complete question with exactly one correct answer", () => {
  assert.equal(questionSaveSchema.safeParse(validQuestion).success, true);
});

test("question bank rejects visual-only or ambiguous question data", () => {
  assert.equal(questionSaveSchema.safeParse({ ...validQuestion, options: [] }).success, false);
  assert.equal(
    questionSaveSchema.safeParse({
      ...validQuestion,
      options: validQuestion.options.map((option) => ({ ...option, correct: true })),
    }).success,
    false,
  );
  assert.equal(
    questionSaveSchema.safeParse({
      ...validQuestion,
      options: validQuestion.options.map((option) => ({ ...option, explanation: "" })),
    }).success,
    false,
  );
});

test("question bank rejects unknown injected properties for strict schema safety", () => {
  assert.equal(
    questionSaveSchema.safeParse({ ...validQuestion, injectedField: "malicious" }).success,
    false,
  );
  assert.equal(
    questionSaveSchema.safeParse({
      ...validQuestion,
      options: [
        { text: "Option A", explanation: "Exp", correct: true, injected: true },
        { text: "Option B", explanation: "Exp", correct: false },
      ],
    }).success,
    false,
  );
});

test("lesson tasks require bounded slide indexes and a real prompt when enabled", () => {
  const enabled = lessonTaskSaveSchema.safeParse({
    lessonId: "lesson-1",
    enabled: true,
    prompt: "Build and explain a working example.",
    requiredSlideIndex: 3,
  });
  assert.equal(enabled.success, true);
  assert.equal(
    lessonTaskSaveSchema.safeParse({
      lessonId: "lesson-1",
      enabled: true,
      prompt: "",
      requiredSlideIndex: -1,
    }).success,
    false,
  );
});
