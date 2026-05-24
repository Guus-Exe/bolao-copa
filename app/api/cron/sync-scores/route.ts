import { NextResponse } from "next/server"

import { recalculateGamePoints } from "@/app/actions/admin-results"
import { fetchFixtures, fetchFixturesByDate } from "@/lib/api-football"
import { supabaseAdmin } from "@/lib/supabase/admin"

// Vercel Cron Limits: 10 seconds execution time for hobby plan.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Busca todos os jogos que ja deviam ter comecado e ainda estao abertos
  const { data: games, error } = await supabaseAdmin
    .from("games")
    .select("id, api_fixture_id")
    .eq("is_finished", false)
    .lte("match_date", new Date().toISOString())

  if (error || !games || games.length === 0) {
    return NextResponse.json({
      success: true,
      message: "Nenhum jogo pendente para sincronizar."
    })
  }

  // Separa jogos com e sem api_fixture_id
  const gamesWithId = games.filter((g) => g.api_fixture_id !== null)
  const gamesWithoutId = games.filter((g) => g.api_fixture_id === null)

  try {
    const synced: string[] = []

    // ---------- Estratégia 1: busca por IDs (jogos com api_fixture_id) ----------
    if (gamesWithId.length > 0) {
      const fixtureIds = gamesWithId.map((g) => g.api_fixture_id as number)
      const apiResults = await fetchFixtures(fixtureIds)

      for (const result of apiResults) {
        const status = result.fixture.status.short

        if (["FT", "AET", "PEN"].includes(status)) {
          const homeScore = result.goals.home
          const awayScore = result.goals.away

          if (homeScore === null || awayScore === null) continue

          const game = gamesWithId.find((g) => g.api_fixture_id === result.fixture.id)
          if (!game) continue

          const { error: updateError } = await supabaseAdmin
            .from("games")
            .update({
              home_score: homeScore,
              away_score: awayScore,
              is_finished: true
            })
            .eq("id", game.id)

          if (!updateError) {
            await recalculateGamePoints(game.id, homeScore, awayScore)
            synced.push(game.id)
          }
        }
      }
    }

    // ---------- Estratégia 2: busca por data (jogos sem api_fixture_id) ----------
    // Tenta vincular pelo nome dos times e data, para jogos cadastrados manualmente
    if (gamesWithoutId.length > 0) {
      const today = new Date().toISOString().slice(0, 10)
      const dateResults = await fetchFixturesByDate(today)

      // Carrega dados completos dos jogos sem ID para comparar nomes
      const { data: fullGames } = await supabaseAdmin
        .from("games")
        .select("*")
        .in(
          "id",
          gamesWithoutId.map((g) => g.id)
        )

      if (fullGames) {
        for (const result of dateResults) {
          const status = result.fixture.status.short
          if (!["FT", "AET", "PEN"].includes(status)) continue

          const homeScore = result.goals.home
          const awayScore = result.goals.away
          if (homeScore === null || awayScore === null) continue

          // Tenta achar o jogo local pelo nome dos times (case-insensitive)
          const apiHome = result.teams.home.name.toLowerCase()
          const apiAway = result.teams.away.name.toLowerCase()

          const matched = fullGames.find(
            (g) =>
              g.home_team.toLowerCase() === apiHome &&
              g.away_team.toLowerCase() === apiAway &&
              !synced.includes(g.id)
          )

          if (!matched) continue

          // Vincula o api_fixture_id para futuras sincronizações
          const { error: updateError } = await supabaseAdmin
            .from("games")
            .update({
              home_score: homeScore,
              away_score: awayScore,
              is_finished: true,
              api_fixture_id: result.fixture.id
            })
            .eq("id", matched.id)

          if (!updateError) {
            await recalculateGamePoints(matched.id, homeScore, awayScore)
            synced.push(matched.id)
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `${synced.length} jogo(s) sincronizado(s) e pontos calculados!`,
      synced
    })
  } catch (err) {
    console.error("Cron Error:", err)
    return NextResponse.json(
      { error: "Falha ao consultar API-Football" },
      { status: 500 }
    )
  }
}
