export type LessonRequirement = "video" | "slides" | "quiz" | "task";

export type LessonCompletionFacts = {
  status?: string | null;
  videoCount: number;
  videoPercent: number;
  slideDeckCount: number;
  lastSlide: number;
  requiredSlideIndex: number;
  quizQuestionCount: number;
  correctQuizQuestionCount: number;
  embeddedQuizCount: number;
  completedEmbeddedQuizCount: number;
  taskEnabled: boolean;
  taskPassed: boolean;
};

export type LessonCompletion = {
  completed: boolean;
  eligible: boolean;
  missing: LessonRequirement[];
  requirements: {
    video: { required: boolean; completed: boolean; percent: number; minimumPercent: 85 };
    slides: {
      required: boolean;
      completed: boolean;
      currentIndex: number;
      requiredIndex: number;
    };
    quiz: {
      required: boolean;
      completed: boolean;
      completedCount: number;
      requiredCount: number;
    };
    task: { required: boolean; completed: boolean };
  };
};

export function lessonCompletion(facts: LessonCompletionFacts): LessonCompletion {
  const videoRequired = facts.videoCount > 0;
  const slidesRequired = facts.slideDeckCount > 0;
  const quizRequiredCount = facts.quizQuestionCount + facts.embeddedQuizCount;
  const quizCompletedCount =
    Math.min(facts.correctQuizQuestionCount, facts.quizQuestionCount) +
    Math.min(facts.completedEmbeddedQuizCount, facts.embeddedQuizCount);
  const requirements = {
    video: {
      required: videoRequired,
      completed: !videoRequired || facts.videoPercent >= 85,
      percent: Math.max(0, Math.min(100, facts.videoPercent)),
      minimumPercent: 85 as const,
    },
    slides: {
      required: slidesRequired,
      completed: !slidesRequired || facts.lastSlide >= facts.requiredSlideIndex,
      currentIndex: Math.max(0, facts.lastSlide),
      requiredIndex: Math.max(0, facts.requiredSlideIndex),
    },
    quiz: {
      required: quizRequiredCount > 0,
      completed: quizRequiredCount === 0 || quizCompletedCount >= quizRequiredCount,
      completedCount: quizCompletedCount,
      requiredCount: quizRequiredCount,
    },
    task: { required: facts.taskEnabled, completed: !facts.taskEnabled || facts.taskPassed },
  };
  const missing = (["video", "slides", "quiz", "task"] as const).filter(
    (key) => requirements[key].required && !requirements[key].completed,
  );
  return {
    completed: facts.status === "completed" || missing.length === 0,
    eligible: missing.length === 0,
    missing,
    requirements,
  };
}
