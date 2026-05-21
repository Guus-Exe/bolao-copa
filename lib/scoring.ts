import { SCORING_RULES } from "@/lib/constants"

export type ScorePair = {
  homeScore: number
  awayScore: number
}

function getOutcome(score: ScorePair) {
  return Math.sign(score.homeScore - score.awayScore)
}

// Calcula a pontuacao de um palpite comparando placar previsto e resultado real.
export function calculatePoints(prediction: ScorePair, result: ScorePair) {
  if (
    prediction.homeScore === result.homeScore &&
    prediction.awayScore === result.awayScore
  ) {
    return SCORING_RULES.EXACT_SCORE
  }

  const predictedOutcome = getOutcome(prediction)
  const resultOutcome = getOutcome(result)

  if (predictedOutcome !== resultOutcome) {
    return SCORING_RULES.WRONG
  }

  if (resultOutcome === 0) {
    return SCORING_RULES.CORRECT_DRAW
  }

  const predictedDiff = Math.abs(prediction.homeScore - prediction.awayScore)
  const resultDiff = Math.abs(result.homeScore - result.awayScore)

  if (predictedDiff === resultDiff) {
    return SCORING_RULES.CORRECT_WINNER_AND_DIFF
  }

  return SCORING_RULES.CORRECT_WINNER
}
