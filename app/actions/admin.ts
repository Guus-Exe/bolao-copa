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
import { fetchFixtures, fetchAllWorldCupFixtures } from "@/lib/api-football"
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
    return { success: false, error: "Você precisa estar logado." }
  }

  // A permissão é sempre conferida no banco antes de qualquer operação sensível.
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
    return { success: false, error: "Não foi possível carregar o resumo." }
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
    return { success: false, error: "Não foi possível carregar os jogos." }
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
    return { success: false, error: "Não foi possível carregar usuários." }
  }

  const {
    data: { users },
    error: usersError
  } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 })

  if (usersError) {
    return { success: false, error: "Não foi possível carregar emails." }
  }

  const emailById = new Map(users.map((user) => [user.id, user.email ?? ""]))

  return {
    success: true,
    data: (profiles ?? []).map((profile) => ({
      ...(profile as Profile),
      email: emailById.get(profile.id) ?? "Email não encontrado"
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
    return { success: false, error: "Não foi possível criar o jogo." }
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
    return { success: false, error: "Dados do jogo inválidos." }
  }

  const { data, error } = await supabaseAdmin
    .from("games")
    .update(parsed.data)
    .eq("id", parsedId.data)
    .select("*")
    .single()

  if (error || !data) {
    return { success: false, error: "Não foi possível atualizar o jogo." }
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
    return { success: false, error: "Jogo inválido." }
  }

  // Primeiro, exclui os palpites vinculados ao jogo para não violar foreign key constraints
  const { error: deletePredictionsError } = await supabaseAdmin
    .from("predictions")
    .delete()
    .eq("game_id", parsed.data)

  if (deletePredictionsError) {
    return { success: false, error: "Não foi possível excluir os palpites vinculados ao jogo." }
  }

  const { error } = await supabaseAdmin
    .from("games")
    .delete()
    .eq("id", parsed.data)

  if (error) {
    return { success: false, error: "Não foi possível excluir o jogo." }
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
    return { success: false, error: "Usuário inválido." }
  }

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ is_paid: parsed.data.value })
    .eq("id", parsed.data.userId)

  if (error) {
    return { success: false, error: "Não foi possível alterar o acesso." }
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
    return { success: false, error: "Usuário inválido." }
  }

  if (admin.data.userId === parsed.data.userId && !parsed.data.value) {
    return {
      success: false,
      error: "Você não pode remover seu próprio acesso admin."
    }
  }

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ is_admin: parsed.data.value })
    .eq("id", parsed.data.userId)

  if (error) {
    return { success: false, error: "Não foi possível alterar admin." }
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
    return { success: false, error: "Usuário inválido." }
  }

  if (admin.data.userId === parsed.data) {
    return { success: false, error: "Você não pode excluir sua própria conta." }
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(parsed.data)

  if (error) {
    return { success: false, error: "Não foi possível excluir o usuário." }
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
    return { success: false, error: "Usuário inválido." }
  }

  const { data, error } = await (supabaseAdmin.from("predictions") as any)
    .select(
      "*, game:games(home_team, away_team, home_flag, away_flag, home_score, away_score, is_finished, match_date)"
    )
    .eq("user_id", parsed.data)
    .order("created_at", { ascending: false })

  if (error) {
    return { success: false, error: "Não foi possível carregar os palpites." }
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

    // FT = Full Time, AET = After Extra Time, PEN = Penalties
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

    // Reuse insertResult which already handles is_finished, updating DB and recalculating points
    return insertResult(parsed.data, homeScore, awayScore, true)
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Erro desconhecido ao buscar API." }
  }
}

// =============================================================
// Importação em lote dos jogos da Copa do Mundo via API-Football
// =============================================================

/** Mapeia o "round" da API-Football para o stage do banco */
function mapRoundToStage(round: string): string {
  const r = round.toLowerCase()
  if (r.includes("group")) return "grupo"
  if (r.includes("16") || r.includes("round of 16")) return "oitavas"
  if (r.includes("quarter")) return "quartas"
  if (r.includes("semi")) return "semi"
  if (r.includes("final") && !r.includes("semi") && !r.includes("quarter")) return "final"
  // 3rd place / play-off pode ser mapeado como "final" também
  if (r.includes("3rd") || r.includes("third")) return "final"
  return "grupo"
}

/** Extrai o nome do grupo a partir do round (ex: "Group A - 1" → "A") */
function extractGroupName(round: string): string | null {
  const match = round.match(/group\s+([a-l])/i)
  return match ? match[1].toUpperCase() : null
}

/** Mapa de países participantes da Copa 2026 → emoji de bandeira */
const COUNTRY_FLAGS: Record<string, string> = {
  // Grupo A–L (48 seleções)
  "Morocco": "🇲🇦",
  "USA": "🇺🇸",
  "United States": "🇺🇸",
  "Mexico": "🇲🇽",
  "Canada": "🇨🇦",
  "Brazil": "🇧🇷",
  "Argentina": "🇦🇷",
  "France": "🇫🇷",
  "England": "🇬🇧",
  "Spain": "🇪🇸",
  "Germany": "🇩🇪",
  "Portugal": "🇵🇹",
  "Netherlands": "🇳🇱",
  "Belgium": "🇧🇪",
  "Italy": "🇮🇹",
  "Croatia": "🇭🇷",
  "Uruguay": "🇺🇾",
  "Colombia": "🇨🇴",
  "Japan": "🇯🇵",
  "South Korea": "🇰🇷",
  "Korea Republic": "🇰🇷",
  "Australia": "🇦🇺",
  "Saudi Arabia": "🇸🇦",
  "Iran": "🇮🇷",
  "Qatar": "🇶🇦",
  "Ecuador": "🇪🇨",
  "Senegal": "🇸🇳",
  "Ghana": "🇬🇭",
  "Cameroon": "🇨🇲",
  "Nigeria": "🇳🇬",
  "Tunisia": "🇹🇳",
  "Egypt": "🇪🇬",
  "Algeria": "🇩🇿",
  "Ivory Coast": "🇨🇮",
  "Cote D'Ivoire": "🇨🇮",
  "Serbia": "🇷🇸",
  "Switzerland": "🇨🇭",
  "Denmark": "🇩🇰",
  "Poland": "🇵🇱",
  "Wales": "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
  "Sweden": "🇸🇪",
  "Austria": "🇦🇹",
  "Czech Republic": "🇨🇿",
  "Turkey": "🇹🇷",
  "Ukraine": "🇺🇦",
  "Scotland": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  "Costa Rica": "🇨🇷",
  "Paraguay": "🇵🇾",
  "Chile": "🇨🇱",
  "Peru": "🇵🇪",
  "Venezuela": "🇻🇪",
  "Bolivia": "🇧🇴",
  "Honduras": "🇭🇳",
  "Panama": "🇵🇦",
  "Jamaica": "🇯🇲",
  "Trinidad And Tobago": "🇹🇹",
  "China": "🇨🇳",
  "Indonesia": "🇮🇩",
  "India": "🇮🇳",
  "New Zealand": "🇳🇿",
  "Uzbekistan": "🇺🇿",
  "Iraq": "🇮🇶",
  "Jordan": "🇯🇴",
  "Palestine": "🇵🇸",
  "Bahrain": "🇧🇭",
  "Oman": "🇴🇲",
  "North Macedonia": "🇲🇰",
  "Iceland": "🇮🇸",
  "Norway": "🇳🇴",
  "Romania": "🇷🇴",
  "Hungary": "🇭🇺",
  "Slovakia": "🇸🇰",
  "Slovenia": "🇸🇮",
  "Georgia": "🇬🇪",
  "Finland": "🇫🇮",
  "Albania": "🇦🇱",
  "Montenegro": "🇲🇪",
  "Bosnia and Herzegovina": "🇧🇦",
  "Russia": "🇷🇺",
  "Ireland": "🇮🇪",
  "Republic of Ireland": "🇮🇪",
  "Greece": "🇬🇷",
  "DR Congo": "🇨🇩",
  "Mali": "🇲🇱",
  "Burkina Faso": "🇧🇫",
  "Zambia": "🇿🇲",
  "Tanzania": "🇹🇿",
  "Uganda": "🇺🇬",
  "Kenya": "🇰🇪",
  "South Africa": "🇿🇦",
  "Congo": "🇨🇬",
  "Mozambique": "🇲🇿",
  "Sudan": "🇸🇩",
  "Comoros": "🇰🇲",
  "Benin": "🇧🇯",
  "Cape Verde": "🇨🇻",
  "Gabon": "🇬🇦",
  "Guatemala": "🇬🇹",
  "El Salvador": "🇸🇻",
  "Cuba": "🇨🇺",
  "Haiti": "🇭🇹",
  "Suriname": "🇸🇷",
  "Curacao": "🇨🇼",
  "Guyana": "🇬🇾",
  "Thailand": "🇹🇭",
  "Vietnam": "🇻🇳",
  "Philippines": "🇵🇭",
  "Malaysia": "🇲🇾",
  "Myanmar": "🇲🇲",
  "Tajikistan": "🇹🇯",
  "Kyrgyzstan": "🇰🇬",
  "Turkmenistan": "🇹🇲",
  "North Korea": "🇰🇵",
  "Lebanon": "🇱🇧",
  "Syria": "🇸🇾",
  "Yemen": "🇾🇪",
  "Afghanistan": "🇦🇫",
  "Kuwait": "🇰🇼",
  "United Arab Emirates": "🇦🇪",
  "Fiji": "🇫🇯",
  "Papua New Guinea": "🇵🇬",
  "Solomon Islands": "🇸🇧",
  "Tahiti": "🇵🇫",
  "New Caledonia": "🇳🇨",
  "Samoa": "🇼🇸",
  "Tonga": "🇹🇴",
  "Vanuatu": "🇻🇺",
}

function getCountryFlag(teamName: string): string {
  return COUNTRY_FLAGS[teamName] ?? "🏳️"
}

export type ImportResult = {
  imported: number
  skipped: number
  total: number
}

export async function importWorldCupGames(): Promise<ActionResult<ImportResult>> {
  const admin = await requireAdmin()

  if (!admin.success) {
    return admin
  }

  try {
    const fixtures = await fetchAllWorldCupFixtures()

    if (fixtures.length === 0) {
      return {
        success: false,
        error: "Nenhum jogo da Copa do Mundo encontrado na API. Verifique se a temporada já está disponível."
      }
    }

    // Buscar api_fixture_ids que já existem no banco para não duplicar
    const { data: existingGames } = await supabaseAdmin
      .from("games")
      .select("api_fixture_id")
      .not("api_fixture_id", "is", null)

    const existingIds = new Set(
      (existingGames ?? []).map((g) => g.api_fixture_id)
    )

    const newGames = fixtures
      .filter((f) => !existingIds.has(f.fixture.id))
      .map((f) => ({
        home_team: f.teams.home.name,
        away_team: f.teams.away.name,
        home_flag: getCountryFlag(f.teams.home.name),
        away_flag: getCountryFlag(f.teams.away.name),
        match_date: f.fixture.date,
        stage: mapRoundToStage(f.league.round),
        group_name: extractGroupName(f.league.round),
        api_fixture_id: f.fixture.id,
        home_score: null,
        away_score: null,
        is_finished: false
      }))

    if (newGames.length === 0) {
      return {
        success: true,
        data: {
          imported: 0,
          skipped: fixtures.length,
          total: fixtures.length
        }
      }
    }

    const { error: insertError } = await supabaseAdmin
      .from("games")
      .insert(newGames)

    if (insertError) {
      return {
        success: false,
        error: "Erro ao importar jogos: " + insertError.message
      }
    }

    revalidatePath("/dashboard")
    revalidateAdminViews()

    return {
      success: true,
      data: {
        imported: newGames.length,
        skipped: fixtures.length - newGames.length,
        total: fixtures.length
      }
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error
        ? err.message
        : "Erro desconhecido ao importar jogos."
    }
  }
}


