"use server"

import "server-only"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { calculatePoints } from "@/lib/scoring"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { adminResultSchema } from "@/lib/validations"
import { fetchFixtures } from "@/lib/api-football"
import { requireAdmin, type ActionResult } from "@/lib/queries/admin"

const idSchema = z.string().uuid()

function revalidateAdminViews() {
  revalidatePath("/admin")
  revalidatePath("/admin/jogos")
  revalidatePath("/admin/usuarios")
  revalidatePath("/admin/controle")
}

export async function recalculateGamePoints(
  gameId: string,
  homeScore: number,
  awayScore: number
): Promise<ActionResult<{ updated: number }>> {
  const { data: predictions, error } = await supabaseAdmin
    .from("predictions")
    .select("id, predicted_home_score, predicted_away_score")
    .eq("game_id", gameId)

  if (error) {
    return {
      success: false,
      error: "Resultado salvo, mas a pontuação não foi recalculada."
    }
  }

  if (!predictions || predictions.length === 0) {
    return { success: true, data: { updated: 0 } }
  }

  const updates = await Promise.all(
    predictions.map((prediction) => {
      const points = calculatePoints(
        {
          homeScore: prediction.predicted_home_score,
          awayScore: prediction.predicted_away_score
        },
        { homeScore, awayScore }
      )

      return supabaseAdmin
        .from("predictions")
        .update({ points_earned: points })
        .eq("id", prediction.id)
    })
  )

  if (updates.some((update) => update.error)) {
    return {
      success: false,
      error: "Resultado salvo, mas a pontuação não foi recalculada."
    }
  }

  return { success: true, data: { updated: updates.length } }
}

export async function insertResult(
  gameId: string,
  homeScore: number,
  awayScore: number,
  isFinished = true
): Promise<ActionResult<{ updated: number }>> {
  const admin = await requireAdmin()

  if (!admin.success) {
    return admin
  }

  const parsed = adminResultSchema.safeParse({
    gameId,
    homeScore,
    awayScore,
    isFinished
  })

  if (!parsed.success || !parsed.data.isFinished) {
    return { success: false, error: "Confirme que o jogo foi finalizado." }
  }

  const { error: updateError } = await supabaseAdmin
    .from("games")
    .update({
      home_score: parsed.data.homeScore,
      away_score: parsed.data.awayScore,
      is_finished: true
    })
    .eq("id", parsed.data.gameId)

  if (updateError) {
    return { success: false, error: "Não foi possível salvar o resultado." }
  }

  const pointsResult = await recalculateGamePoints(
    parsed.data.gameId,
    parsed.data.homeScore,
    parsed.data.awayScore
  )

  if (!pointsResult.success) {
    return {
      success: false,
      error: pointsResult.error
    }
  }

  revalidatePath("/dashboard")
  revalidatePath("/ranking")
  revalidateAdminViews()

  return { success: true, data: { updated: pointsResult.data.updated } }
}

export async function clearResult(gameId: string): Promise<ActionResult> {
  const admin = await requireAdmin()

  if (!admin.success) {
    return admin
  }

  const parsed = idSchema.safeParse(gameId)

  if (!parsed.success) {
    return { success: false, error: "Jogo inválido." }
  }

  const { error: updateError } = await supabaseAdmin
    .from("games")
    .update({
      home_score: null,
      away_score: null,
      is_finished: false
    })
    .eq("id", parsed.data)

  if (updateError) {
    return { success: false, error: "Não foi possível limpar o resultado." }
  }

  const { error: predictionsError } = await supabaseAdmin
    .from("predictions")
    .update({ points_earned: null })
    .eq("game_id", parsed.data)

  if (predictionsError) {
    return {
      success: false,
      error: "Resultado limpo, mas os pontos não foram resetados."
    }
  }

  revalidatePath("/dashboard")
  revalidatePath("/ranking")
  revalidateAdminViews()

  return { success: true, data: undefined }
}

export async function syncGameScore(gameId: string): Promise<ActionResult<{ updated: number }>> {
  const admin = await requireAdmin()

  if (!admin.success) {
    return admin
  }

  const parsed = idSchema.safeParse(gameId)
  if (!parsed.success) {
    return { success: false, error: "Jogo inválido." }
  }

  const { data: game, error } = await supabaseAdmin
    .from("games")
    .select("*")
    .eq("id", parsed.data)
    .single()

  if (error || !game) {
    return { success: false, error: "Jogo não encontrado." }
  }

  if (!game.api_fixture_id) {
    return { success: false, error: "Este jogo não possui ID da API-Football vinculado." }
  }

  try {
    const fixtures = await fetchFixtures([game.api_fixture_id])
    if (fixtures.length === 0) {
      return { success: false, error: "Partida não encontrada na API." }
    }

    const fixtureData = fixtures[0]
    const status = fixtureData.fixture.status.short

    if (!["FT", "AET", "PEN"].includes(status)) {
      return {
        success: false,
        error: `A partida ainda não foi finalizada. Status atual: ${status}`
      }
    }

    const homeScore = fixtureData.goals.home
    const awayScore = fixtureData.goals.away

    if (homeScore === null || awayScore === null) {
      return { success: false, error: "Placar final ainda não disponível na API." }
    }

    return insertResult(parsed.data, homeScore, awayScore, true)
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Erro desconhecido ao buscar API." }
  }
}
