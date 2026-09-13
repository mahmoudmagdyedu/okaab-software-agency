export type SlideLearningEvent =
  | { type: "slide_changed"; index: number; [key: string]: unknown }
  | {
      type: "quiz_finished";
      correctAnswers: number;
      totalQuestions: number;
      scorePercent: number;
      [key: string]: unknown;
    }
  | { type: "task_result"; passed: boolean; [key: string]: unknown }
  | { type: "lesson_finished"; [key: string]: unknown };

type SlideMessage = { source?: unknown; event?: unknown };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function validEvent(value: unknown): value is SlideLearningEvent {
  if (!isRecord(value) || typeof value["type"] !== "string") return false;
  if (value["type"] === "slide_changed") {
    return Number.isInteger(value["index"]) && Number(value["index"]) >= 0;
  }
  if (value["type"] === "quiz_finished") {
    const correct = Number(value["correctAnswers"]);
    const total = Number(value["totalQuestions"]);
    const percent = Number(value["scorePercent"]);
    return (
      Number.isInteger(correct) &&
      Number.isInteger(total) &&
      total > 0 &&
      correct >= 0 &&
      correct <= total &&
      Number.isInteger(percent) &&
      percent === Math.round((correct / total) * 100)
    );
  }
  if (value["type"] === "task_result") return typeof value["passed"] === "boolean";
  return value["type"] === "lesson_finished";
}

export function trustedSlideEvent(
  message: Pick<MessageEvent, "origin" | "source" | "data">,
  frameWindow: Window | null | undefined,
  pageOrigin: string,
): SlideLearningEvent | null {
  if (!frameWindow || message.source !== frameWindow) return null;
  if (message.origin !== pageOrigin && message.origin !== "null") return null;
  const payload = message.data as SlideMessage;
  if (!isRecord(payload) || payload.source !== "okaab-lesson" || !validEvent(payload.event)) {
    return null;
  }
  return payload.event;
}
