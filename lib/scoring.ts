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

  if (predictedOutcome === resultOutcome) {
    return SCORING_RULES.CORRECT_WINNER
  }

  return SCORING_RULES.WRONG
}
