export function slideQuizAward(correctAnswers: number, previousBest: number, pointsPerAnswer: number) {
  if (![correctAnswers, previousBest, pointsPerAnswer].every(Number.isSafeInteger)) {
    throw new TypeError("Slide quiz scoring requires integers");
  }
  if (correctAnswers < 0 || previousBest < 0 || pointsPerAnswer < 0) {
    throw new RangeError("Slide quiz scoring values cannot be negative");
  }
  const gainedAnswers = Math.max(0, correctAnswers - previousBest);
  return { gainedAnswers, awardedXp: gainedAnswers * pointsPerAnswer };
}

export function slideQuizOutcome(input: {
  scorePercent: number;
  correctAnswers: number;
  previousBestScorePercent: number;
  previousBestCorrectAnswers: number;
  pointsPerAnswer: number;
}) {
  const improved = input.scorePercent > input.previousBestScorePercent;
  const { awardedXp } = improved
    ? slideQuizAward(input.correctAnswers, input.previousBestCorrectAnswers, input.pointsPerAnswer)
    : { awardedXp: 0 };
  return {
    bestScorePercent: Math.max(input.previousBestScorePercent, input.scorePercent),
    improved,
    awardedXp,
  };
}
