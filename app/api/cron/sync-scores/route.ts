import { NextResponse } from "next/server"

import { recalculateGamePoints } from "@/app/actions/admin"
import { fetchFixtures } from "@/lib/api-football"
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
    .not("api_fixture_id", "is", null)
    .lte("match_date", new Date().toISOString())

  if (error || !games || games.length === 0) {
    return NextResponse.json({
      success: true,
      message: "Nenhum jogo pendente para sincronizar."
    })
  }

  const fixtureIds = games.map((g) => g.api_fixture_id as number)

  try {
    // Fazemos UMA UNICA CHAMADA a API-Football passando todos os IDs do dia!
    const apiResults = await fetchFixtures(fixtureIds)
    const synced = []

    for (const result of apiResults) {
      const status = result.fixture.status.short

      if (["FT", "AET", "PEN"].includes(status)) {
        const homeScore = result.goals.home
        const awayScore = result.goals.away

        if (homeScore === null || awayScore === null) continue

        const game = games.find((g) => g.api_fixture_id === result.fixture.id)
        if (!game) continue

        // 1. Salva o resultado no banco
        const { error: updateError } = await supabaseAdmin
          .from("games")
          .update({
            home_score: homeScore,
            away_score: awayScore,
            is_finished: true
          })
          .eq("id", game.id)

        if (!updateError) {
          // 2. Recalcula os pontos dos palpites
          await recalculateGamePoints(game.id, homeScore, awayScore)
          synced.push(game.id)
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
