import { createServerClient } from "@/lib/supabase/server"
import type { RankingEntry } from "@/types"

export async function getRankingEntries(): Promise<{
  ranking: RankingEntry[]
  error: string | null
}> {
  const supabase = createServerClient()

  // Consulta a ranking_view que já calcula tudo no banco
  const { data: rankingData, error } = await supabase
    .from("ranking_view")
    .select(
      "user_id, username, avatar_url, total_points, total_predictions, exact_scores, correct_predictions, position"
    )
    .order("position", { ascending: true })

  if (error) {
    console.error("Erro ao carregar ranking:", error)
    return { ranking: [], error: "Não foi possível carregar o ranking." }
  }

  const ranking = (rankingData ?? []) as RankingEntry[]

  return { ranking, error: null }
}
