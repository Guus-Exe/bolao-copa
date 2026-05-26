"use server"

import "server-only"

import { revalidatePath } from "next/cache"


import { supabaseAdmin } from "@/lib/supabase/admin"
import { createServerClient } from "@/lib/supabase/server"
import { predictionSchema } from "@/lib/validations"
import type { Prediction } from "@/types"
import type { ActionResult } from "@/types"


export async function savePrediction(
  gameId: string,
  homeScore: number,
  awayScore: number
): Promise<ActionResult<Prediction>> {
  const parsed = predictionSchema.safeParse({ gameId, homeScore, awayScore })

  if (!parsed.success) {
    return { success: false, error: "Informe um placar válido." }
  }

  const supabase = createServerClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Você precisa estar logado." }
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("is_paid")
    .eq("id", user.id)
    .single()
  const profile = profileData as { is_paid: boolean } | null

  if (!profile?.is_paid) {
    return { success: false, error: "Seu acesso ainda não foi liberado." }
  }

  const { data: gameData } = await supabase
    .from("games")
    .select("match_date, is_finished, home_score, away_score")
    .eq("id", parsed.data.gameId)
    .single()
  const game = gameData as {
    match_date: string
    is_finished: boolean
    home_score: number | null
    away_score: number | null
  } | null

  if (!game) {
    return { success: false, error: "Jogo não encontrado." }
  }

  // Bloqueia palpites em jogos já finalizados ou que já tenham placar registrado
  if (game.is_finished === true || game.home_score !== null || game.away_score !== null) {
    return {
      success: false,
      error: "Este jogo já foi finalizado ou possui resultado cadastrado. Não é possível palpitar."
    }
  }

  // match_date vem do banco como timestamptz/UTC; a comparação fica em epoch UTC.
  const now = new Date()
  const deadline = new Date(game.match_date).getTime() - 60 * 60 * 1000

  if (now.getTime() >= deadline) {
    return {
      success: false,
      error: "Fora do prazo!"
    }
  }

  // O service role evita bloqueio indevido de RLS em jogos de teste já marcados
  // como finalizados. A segurança vem das checagens acima e do user.id da sessão.
  const { data, error } = await supabaseAdmin
    .from("predictions")
    .upsert(
      {
        user_id: user.id,
        game_id: parsed.data.gameId,
        predicted_home_score: parsed.data.homeScore,
        predicted_away_score: parsed.data.awayScore,
        points_earned: null
      },
      { onConflict: "user_id,game_id" }
    )
    .select("*")
    .single()

  if (error || !data) {
    return { success: false, error: "Não foi possível salvar o palpite." }
  }

  revalidatePath("/dashboard")

  return { success: true, data: data as Prediction }
}

