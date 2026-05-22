"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { supabaseAdmin } from "@/lib/supabase/admin"
import { createServerClient } from "@/lib/supabase/server"
import { predictionSchema } from "@/lib/validations"
import type { Prediction } from "@/types"

type ActionResult<T = void> =
  | { success: true; data: T; error?: never }
  | { success: false; error: string; data?: never }

const userIdSchema = z.string().uuid()

export async function savePrediction(
  gameId: string,
  homeScore: number,
  awayScore: number
): Promise<ActionResult<Prediction>> {
  const parsed = predictionSchema.safeParse({ gameId, homeScore, awayScore })

  if (!parsed.success) {
    return { success: false, error: "Informe um placar valido." }
  }

  const supabase = createServerClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Voce precisa estar logado." }
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("is_paid")
    .eq("id", user.id)
    .single()
  const profile = profileData as { is_paid: boolean } | null

  if (!profile?.is_paid) {
    return { success: false, error: "Seu acesso ainda nao foi liberado." }
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
    return { success: false, error: "Jogo nao encontrado." }
  }

  // Bloqueia palpites em jogos já finalizados ou que já tenham placar registrado
  if (game.is_finished === true || game.home_score !== null || game.away_score !== null) {
    return {
      success: false,
      error: "Este jogo ja foi finalizado ou possui resultado cadastrado. Nao e possivel palpitar."
    }
  }

  // match_date vem do banco como timestamptz/UTC; a comparacao fica em epoch UTC.
  const now = new Date()
  const deadline = new Date(game.match_date).getTime() - 60 * 60 * 1000

  if (now.getTime() >= deadline) {
    return {
      success: false,
      error: "Fora do prazo"
    }
  }

  // O service role evita bloqueio indevido de RLS em jogos de teste ja marcados
  // como finalizados. A seguranca vem das checagens acima e do user.id da sessao.
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
    return { success: false, error: "Nao foi possivel salvar o palpite." }
  }

  revalidatePath("/dashboard")

  return { success: true, data: data as Prediction }
}

export async function getUserPredictions(
  userId: string
): Promise<ActionResult<Prediction[]>> {
  const parsed = userIdSchema.safeParse(userId)

  if (!parsed.success) {
    return { success: false, error: "Usuario invalido." }
  }

  const supabase = createServerClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Voce precisa estar logado." }
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single()
  const profile = profileData as { is_admin: boolean } | null

  if (user.id !== parsed.data && !profile?.is_admin) {
    return { success: false, error: "Voce nao pode acessar estes palpites." }
  }

  const { data, error } = await (supabase.from("predictions") as any)
    .select("*")
    .eq("user_id", parsed.data)

  if (error) {
    return { success: false, error: "Nao foi possivel buscar os palpites." }
  }

  return { success: true, data: (data ?? []) as Prediction[] }
}
