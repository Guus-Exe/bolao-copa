"use server"

import "server-only"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { calculatePoints } from "@/lib/scoring"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { createServerClient } from "@/lib/supabase/server"
import {
  adminGameSchema,
  adminResultSchema,
  adminUserToggleSchema
} from "@/lib/validations"
import { fetchFixtures } from "@/lib/api-football"
import type { Game, Prediction, Profile } from "@/types"

type ActionResult<T = void> =
  | { success: true; data: T; error?: never }
  | { success: false; error: string; data?: never }

export type AdminSummary = {
  totalUsers: number
  paidUsers: number
  pendingUsers: number
  totalGames: number
}

export type AdminUser = Profile & {
  email: string
}

export type AdminPrediction = Prediction & {
  game: Pick<
    Game,
    | "home_team"
    | "away_team"
    | "home_flag"
    | "away_flag"
    | "home_score"
    | "away_score"
    | "is_finished"
    | "match_date"
  > | null
}

const idSchema = z.string().uuid()

async function requireAdmin(): Promise<ActionResult<{ userId: string }>> {
  const supabase = createServerClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Voce precisa estar logado." }
  }

  // A permissao e sempre conferida no banco antes de qualquer operacao sensivel.
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single()

  if (error || !data?.is_admin) {
    return { success: false, error: "Acesso restrito a administradores." }
  }

  return { success: true, data: { userId: user.id } }
}

function normalizeGameInput(input: unknown) {
  if (typeof input !== "object" || input === null) {
    return input
  }

  const data = input as Record<string, unknown>
  return {
    ...data,
    group_name:
      typeof data.group_name === "string" && data.group_name.trim().length > 0
        ? data.group_name.trim()
        : null,
    api_fixture_id: data.api_fixture_id ?? null
  }
}

function revalidateAdminViews() {
  revalidatePath("/admin")
  revalidatePath("/admin/jogos")
  revalidatePath("/admin/usuarios")
  revalidatePath("/admin/controle")
}

export async function getAdminSummary(): Promise<ActionResult<AdminSummary>> {
  const admin = await requireAdmin()

  if (!admin.success) {
    return admin
  }

  const [totalUsers, paidUsers, pendingUsers, totalGames] = await Promise.all([
    supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }),
    supabaseAdmin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("is_paid", true),
    supabaseAdmin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("is_paid", false),
    supabaseAdmin.from("games").select("id", { count: "exact", head: true })
  ])

  if (
    totalUsers.error ||
    paidUsers.error ||
    pendingUsers.error ||
    totalGames.error
  ) {
    return { success: false, error: "Nao foi possivel carregar o resumo." }
  }

  return {
    success: true,
    data: {
      totalUsers: totalUsers.count ?? 0,
      paidUsers: paidUsers.count ?? 0,
      pendingUsers: pendingUsers.count ?? 0,
      totalGames: totalGames.count ?? 0
    }
  }
}

export async function getAdminGames(): Promise<ActionResult<Game[]>> {
  const admin = await requireAdmin()

  if (!admin.success) {
    return admin
  }

  const { data, error } = await supabaseAdmin
    .from("games")
    .select("*")
    .order("match_date", { ascending: true })

  if (error) {
    return { success: false, error: "Nao foi possivel carregar os jogos." }
  }

  return { success: true, data: (data ?? []) as Game[] }
}

export async function getAdminUsers(): Promise<ActionResult<AdminUser[]>> {
  const admin = await requireAdmin()

  if (!admin.success) {
    return admin
  }

  const { data: profiles, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    return { success: false, error: "Nao foi possivel carregar usuarios." }
  }

  const {
    data: { users },
    error: usersError
  } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 })

  if (usersError) {
    return { success: false, error: "Nao foi possivel carregar emails." }
  }

  const emailById = new Map(users.map((user) => [user.id, user.email ?? ""]))

  return {
    success: true,
    data: (profiles ?? []).map((profile) => ({
      ...(profile as Profile),
      email: emailById.get(profile.id) ?? "Email nao encontrado"
    }))
  }
}

export async function createGame(input: unknown): Promise<ActionResult<Game>> {
  const admin = await requireAdmin()

  if (!admin.success) {
    return admin
  }

  const parsed = adminGameSchema.safeParse(normalizeGameInput(input))

  if (!parsed.success) {
    return { success: false, error: "Preencha os dados do jogo corretamente." }
  }

  const { data, error } = await supabaseAdmin
    .from("games")
    .insert(parsed.data)
    .select("*")
    .single()

  if (error || !data) {
    return { success: false, error: "Nao foi possivel criar o jogo." }
  }

  revalidatePath("/dashboard")
  revalidateAdminViews()

  return { success: true, data: data as Game }
}

export async function updateGame(
  id: string,
  input: unknown
): Promise<ActionResult<Game>> {
  const admin = await requireAdmin()

  if (!admin.success) {
    return admin
  }

  const parsedId = idSchema.safeParse(id)
  const parsed = adminGameSchema.safeParse(normalizeGameInput(input))

  if (!parsedId.success || !parsed.success) {
    return { success: false, error: "Dados do jogo invalidos." }
  }

  const { data, error } = await supabaseAdmin
    .from("games")
    .update(parsed.data)
    .eq("id", parsedId.data)
    .select("*")
    .single()

  if (error || !data) {
    return { success: false, error: "Nao foi possivel atualizar o jogo." }
  }

  revalidatePath("/dashboard")
  revalidateAdminViews()

  return { success: true, data: data as Game }
}

export async function deleteGame(id: string): Promise<ActionResult> {
  const admin = await requireAdmin()

  if (!admin.success) {
    return admin
  }

  const parsed = idSchema.safeParse(id)

  if (!parsed.success) {
    return { success: false, error: "Jogo invalido." }
  }

  const { error } = await supabaseAdmin
    .from("games")
    .delete()
    .eq("id", parsed.data)

  if (error) {
    return { success: false, error: "Nao foi possivel excluir o jogo." }
  }

  revalidatePath("/dashboard")
  revalidatePath("/ranking")
  revalidateAdminViews()

  return { success: true, data: undefined }
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
    return { success: false, error: "Nao foi possivel salvar o resultado." }
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
      error: "Resultado salvo, mas a pontuacao nao foi recalculada."
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
      error: "Resultado salvo, mas a pontuacao nao foi recalculada."
    }
  }

  return { success: true, data: { updated: updates.length } }
}

export async function clearResult(gameId: string): Promise<ActionResult> {
  const admin = await requireAdmin()

  if (!admin.success) {
    return admin
  }

  const parsed = idSchema.safeParse(gameId)

  if (!parsed.success) {
    return { success: false, error: "Jogo invalido." }
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
    return { success: false, error: "Nao foi possivel limpar o resultado." }
  }

  const { error: predictionsError } = await supabaseAdmin
    .from("predictions")
    .update({ points_earned: null })
    .eq("game_id", parsed.data)

  if (predictionsError) {
    return {
      success: false,
      error: "Resultado limpo, mas os pontos nao foram resetados."
    }
  }

  revalidatePath("/dashboard")
  revalidatePath("/ranking")
  revalidateAdminViews()

  return { success: true, data: undefined }
}

export async function toggleUserAccess(
  userId: string,
  isPaid: boolean
): Promise<ActionResult> {
  const admin = await requireAdmin()

  if (!admin.success) {
    return admin
  }

  const parsed = adminUserToggleSchema.safeParse({ userId, value: isPaid })

  if (!parsed.success) {
    return { success: false, error: "Usuario invalido." }
  }

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ is_paid: parsed.data.value })
    .eq("id", parsed.data.userId)

  if (error) {
    return { success: false, error: "Nao foi possivel alterar o acesso." }
  }

  revalidatePath("/dashboard")
  revalidatePath("/ranking")
  revalidateAdminViews()

  return { success: true, data: undefined }
}

export async function toggleUserAdmin(
  userId: string,
  isAdmin: boolean
): Promise<ActionResult> {
  const admin = await requireAdmin()

  if (!admin.success) {
    return admin
  }

  const parsed = adminUserToggleSchema.safeParse({ userId, value: isAdmin })

  if (!parsed.success) {
    return { success: false, error: "Usuario invalido." }
  }

  if (admin.data.userId === parsed.data.userId && !parsed.data.value) {
    return {
      success: false,
      error: "Voce nao pode remover seu proprio acesso admin."
    }
  }

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ is_admin: parsed.data.value })
    .eq("id", parsed.data.userId)

  if (error) {
    return { success: false, error: "Nao foi possivel alterar admin." }
  }

  revalidateAdminViews()

  return { success: true, data: undefined }
}

export async function deleteUser(userId: string): Promise<ActionResult> {
  const admin = await requireAdmin()

  if (!admin.success) {
    return admin
  }

  const parsed = idSchema.safeParse(userId)

  if (!parsed.success) {
    return { success: false, error: "Usuario invalido." }
  }

  if (admin.data.userId === parsed.data) {
    return { success: false, error: "Voce nao pode excluir sua propria conta." }
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(parsed.data)

  if (error) {
    return { success: false, error: "Nao foi possivel excluir o usuario." }
  }

  revalidatePath("/ranking")
  revalidateAdminViews()

  return { success: true, data: undefined }
}

export async function getUserPredictionsForAdmin(
  userId: string
): Promise<ActionResult<AdminPrediction[]>> {
  const admin = await requireAdmin()

  if (!admin.success) {
    return admin
  }

  const parsed = idSchema.safeParse(userId)

  if (!parsed.success) {
    return { success: false, error: "Usuario invalido." }
  }

  const { data, error } = await (supabaseAdmin.from("predictions") as any)
    .select(
      "*, game:games(home_team, away_team, home_flag, away_flag, home_score, away_score, is_finished, match_date)"
    )
    .eq("user_id", parsed.data)
    .order("created_at", { ascending: false })

  if (error) {
    return { success: false, error: "Nao foi possivel carregar os palpites." }
  }

  return { success: true, data: (data ?? []) as AdminPrediction[] }
}

export async function syncGameScore(gameId: string): Promise<ActionResult<{ updated: number }>> {
  const admin = await requireAdmin()

  if (!admin.success) {
    return admin
  }

  const parsed = idSchema.safeParse(gameId)
  if (!parsed.success) {
    return { success: false, error: "Jogo invalido." }
  }

  const { data: game, error } = await supabaseAdmin
    .from("games")
    .select("*")
    .eq("id", parsed.data)
    .single()

  if (error || !game) {
    return { success: false, error: "Jogo nao encontrado." }
  }

  if (!game.api_fixture_id) {
    return { success: false, error: "Este jogo nao possui ID da API-Football vinculado." }
  }

  try {
    const fixtures = await fetchFixtures([game.api_fixture_id])
    if (fixtures.length === 0) {
      return { success: false, error: "Partida nao encontrada na API." }
    }

    const fixtureData = fixtures[0]
    const status = fixtureData.fixture.status.short

    // FT = Full Time, AET = After Extra Time, PEN = Penalties
    if (!["FT", "AET", "PEN"].includes(status)) {
      return {
        success: false,
        error: `A partida ainda nao foi finalizada. Status atual: ${status}`
      }
    }

    const homeScore = fixtureData.goals.home
    const awayScore = fixtureData.goals.away

    if (homeScore === null || awayScore === null) {
      return { success: false, error: "Placar final ainda nao disponivel na API." }
    }

    // Reuse insertResult which already handles is_finished, updating DB and recalculating points
    return insertResult(parsed.data, homeScore, awayScore, true)
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Erro desconhecido ao buscar API." }
  }
}

