import { supabaseAdmin } from "@/lib/supabase/admin"
import { createServerClient } from "@/lib/supabase/server"
import type { RankingEntry } from "@/types"

export async function getRankingEntries(): Promise<{
  ranking: RankingEntry[]
  error: string | null
}> {
  const supabase = createServerClient()

  // Verifica se o usuário está autenticado antes de consultar dados confidenciais via admin client
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { ranking: [], error: "Não autorizado." }
  }

  // 1. Tenta consultar a ranking_view no banco
  const { data: rankingData, error: viewError } = await supabaseAdmin
    .from("ranking_view")
    .select(
      "user_id, username, avatar_url, total_points, total_predictions, exact_scores, exact_scores_hosts, exact_scores_brazil, correct_predictions, position, first_prediction_at"
    )
    .order("position", { ascending: true })

  if (!viewError && rankingData) {
    return { ranking: rankingData as RankingEntry[], error: null }
  }

  console.warn("View 'ranking_view' nao encontrada ou falhou. Usando calculo em memoria fallback: ", viewError?.message)

  // 2. Fallback: Calcula a classificacao em memoria de forma segura no servidor
  try {
    // Busca perfis liberados (is_paid = true)
    const { data: profiles, error: pError } = await supabaseAdmin
      .from("profiles")
      .select("id, username, avatar_url, created_at")
      .eq("is_paid", true)

    if (pError || !profiles) throw pError || new Error("Erro ao obter perfis")

    // Busca palpites com dados dos jogos integrados
    const { data: predictions, error: prError } = await supabaseAdmin
      .from("predictions")
      .select(`
        user_id,
        points_earned,
        predicted_home_score,
        predicted_away_score,
        created_at,
        game:games(home_team, away_team, home_score, away_score, is_finished)
      `)

    if (prError || !predictions) throw prError || new Error("Erro ao obter palpites")

    // Agrupa palpites por usuario
    const predictionsByUser = new Map<string, typeof predictions>()
    predictions.forEach((pred) => {
      if (!predictionsByUser.has(pred.user_id)) {
        predictionsByUser.set(pred.user_id, [])
      }
      predictionsByUser.get(pred.user_id)!.push(pred)
    })

    const entries: RankingEntry[] = profiles.map((profile) => {
      const userPreds = predictionsByUser.get(profile.id) ?? []
      let totalPoints = 0
      let exactScores = 0
      let exactScoresHosts = 0
      let exactScoresBrazil = 0
      let correctPredictions = 0
      let firstPredictionAt = profile.created_at

      userPreds.forEach((pred) => {
        if (pred.created_at < firstPredictionAt) {
          firstPredictionAt = pred.created_at
        }
        
        const points = pred.points_earned ?? 0
        totalPoints += points
        if (points > 0) {
          correctPredictions++
        }

        const game = pred.game as {
          home_team: string
          away_team: string
          home_score: number | null
          away_score: number | null
          is_finished: boolean
        } | null
        if (
          game &&
          game.is_finished &&
          game.home_score !== null &&
          game.away_score !== null &&
          pred.predicted_home_score === game.home_score &&
          pred.predicted_away_score === game.away_score
        ) {
          exactScores++
          const isHost = ["Estados Unidos", "México", "Canadá"].includes(game.home_team) || ["Estados Unidos", "México", "Canadá"].includes(game.away_team)
          const isBrazil = game.home_team === "Brasil" || game.away_team === "Brasil"
          if (isHost) exactScoresHosts++
          if (isBrazil) exactScoresBrazil++
        }
      })

      return {
        user_id: profile.id,
        username: profile.username,
        avatar_url: profile.avatar_url,
        total_points: totalPoints,
        total_predictions: userPreds.length,
        exact_scores: exactScores,
        exact_scores_hosts: exactScoresHosts,
        exact_scores_brazil: exactScoresBrazil,
        correct_predictions: correctPredictions,
        first_prediction_at: firstPredictionAt,
        position: 0
      }
    })

    // Ordena de acordo com o criterio: pontos -> placares exatos -> placares exatos anfitriões -> placares exatos brasil -> data do primeiro palpite
    entries.sort((a, b) => {
      if (b.total_points !== a.total_points) return b.total_points - a.total_points
      if (b.exact_scores !== a.exact_scores) return b.exact_scores - a.exact_scores
      if (b.exact_scores_hosts !== a.exact_scores_hosts) return b.exact_scores_hosts - a.exact_scores_hosts
      if (b.exact_scores_brazil !== a.exact_scores_brazil) return b.exact_scores_brazil - a.exact_scores_brazil
      
      const timeA = new Date(a.first_prediction_at).getTime()
      const timeB = new Date(b.first_prediction_at).getTime()
      if (timeA !== timeB) return timeA - timeB

      return a.username.localeCompare(b.username)
    })

    // Atribui posicoes respeitando empates
    let currentRank = 1
    for (let i = 0; i < entries.length; i++) {
      if (i > 0) {
        const prev = entries[i - 1]
        const curr = entries[i]
        const isTie =
          prev.total_points === curr.total_points &&
          prev.exact_scores === curr.exact_scores &&
          prev.exact_scores_hosts === curr.exact_scores_hosts &&
          prev.exact_scores_brazil === curr.exact_scores_brazil

        if (!isTie) {
          currentRank = i + 1
        }
      }
      entries[i].position = currentRank
    }

    return { ranking: entries, error: null }
  } catch (fallbackError: unknown) {
    console.error("Erro no fallback de calculo de ranking:", fallbackError)
    return { ranking: [], error: "Não foi possível carregar o ranking." }
  }
}
