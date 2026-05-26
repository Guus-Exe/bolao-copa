import type { Database } from "@/types/database"

/** Tipo de retorno padronizado para Server Actions e queries. */
export type ActionResult<T = void> =
  | { success: true; data: T; error?: never }
  | { success: false; error: string; data?: never }

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"]

export type Profile = Tables<"profiles">
export type Game = Tables<"games">
export type Prediction = Tables<"predictions">
export type ChatMessage = Tables<"chat_messages">

export type ChatMessageWithProfile = {
  id: string
  content: string
  created_at: string
  user_id: string
  profiles: {
    username: string
    avatar_url: string | null
  } | null
  // reactions removido — migration 20260524173104_drop_chat_reactions.sql
}

export type GameWithPrediction = Game & {
  prediction: Prediction | null
}

export type RankingEntry = {
  user_id: string
  username: string
  avatar_url: string | null
  total_points: number
  total_predictions: number
  exact_scores: number
  exact_scores_hosts: number
  exact_scores_brazil: number
  correct_predictions: number
  position: number
  first_prediction_at: string
}
