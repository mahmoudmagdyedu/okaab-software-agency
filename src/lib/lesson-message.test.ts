import assert from "node:assert/strict";
import test from "node:test";

import { trustedSlideEvent } from "./lesson-message.ts";

const frame = {} as Window;

test("accepts validated events from the matching sandboxed iframe", () => {
  const event = trustedSlideEvent(
    {
      origin: "null",
      source: frame,
      data: { source: "okaab-lesson", event: { type: "slide_changed", index: 22 } },
    } as Pick<MessageEvent, "origin" | "source" | "data">,
    frame,
    "https://okaab.org",
  );
  assert.deepEqual(event, { type: "slide_changed", index: 22 });
});

test("rejects spoofed windows, foreign origins and malformed quiz results", () => {
  const validData = {
    source: "okaab-lesson",
    event: { type: "quiz_finished", correctAnswers: 8, totalQuestions: 10, scorePercent: 80 },
  };
  assert.equal(
    trustedSlideEvent(
      { origin: "null", source: {} as Window, data: validData } as Pick<
        MessageEvent,
        "origin" | "source" | "data"
      >,
      frame,
      "https://okaab.org",
    ),
    null,
  );
  assert.equal(
    trustedSlideEvent(
      { origin: "https://evil.example", source: frame, data: validData } as Pick<
        MessageEvent,
        "origin" | "source" | "data"
      >,
      frame,
      "https://okaab.org",
    ),
    null,
  );
  assert.equal(
    trustedSlideEvent(
      {
        origin: "null",
        source: frame,
        data: { ...validData, event: { ...validData.event, scorePercent: 90 } },
      } as Pick<MessageEvent, "origin" | "source" | "data">,
      frame,
      "https://okaab.org",
    ),
    null,
  );
});
