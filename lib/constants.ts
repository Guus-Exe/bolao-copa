export const SCORING_RULES = {
  EXACT_SCORE: 3,
  CORRECT_WINNER: 1,
  WRONG: 0
} as const

export const GAME_STAGES = [
  "grupo",
  "oitavas",
  "quartas",
  "semi",
  "final"
] as const

export const PREDICTION_DEADLINE_HOURS = 1

export type GameStage = (typeof GAME_STAGES)[number]
