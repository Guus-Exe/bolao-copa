"use server"

import "server-only"

import { revalidatePath, revalidateTag } from "next/cache"
import { z } from "zod"

import { supabaseAdmin } from "@/lib/supabase/admin"
import { adminGameSchema } from "@/lib/validations"
import { fetchAllWorldCupFixtures } from "@/lib/api-football"
import { extractGamesFromText, extractTextFromPDF } from "@/lib/pdf-game-extractor"
import { requireAdmin } from "@/lib/queries/admin"
import type { Game } from "@/types"
import type { ActionResult } from "@/types"
import { COUNTRY_FLAGS } from "@/lib/constants"

const idSchema = z.string().uuid()

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
  revalidateTag("games", "default")
  revalidateTag("ranking", "default")
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

export async function deleteAllGames(): Promise<ActionResult> {
  const admin = await requireAdmin()

  if (!admin.success) {
    return admin
  }

  const { error: deletePredictionsError } = await supabaseAdmin
    .from("predictions")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000")

  if (deletePredictionsError) {
    return { success: false, error: "Não foi possível excluir os palpites vinculados aos jogos." }
  }

  const { error } = await supabaseAdmin
    .from("games")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000")

  if (error) {
    return { success: false, error: "Não foi possível excluir os jogos." }
  }

  revalidatePath("/dashboard")
  revalidatePath("/ranking")
  revalidateAdminViews()

  return { success: true, data: undefined }
}

// =============================================================
// Importação em lote dos jogos da Copa do Mundo via API-Football
// =============================================================

function mapRoundToStage(round: string): string {
  const r = round.toLowerCase()
  if (r.includes("group")) return "grupo"
  if (r.includes("16") || r.includes("round of 16")) return "oitavas"
  if (r.includes("quarter")) return "quartas"
  if (r.includes("semi")) return "semi"
  if (r.includes("final") && !r.includes("semi") && !r.includes("quarter")) return "final"
  if (r.includes("3rd") || r.includes("third")) return "final"
  return "grupo"
}

function extractGroupName(round: string): string | null {
  const match = round.match(/group\s+([a-l])/i)
  return match ? match[1].toUpperCase() : null
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

export type PDFImportResult = ImportResult & { warnings: string[] }

export async function importGamesFromUploadedPDF(
  formData: FormData
): Promise<ActionResult<PDFImportResult>> {
  const admin = await requireAdmin()
  if (!admin.success) return admin

  const file = formData.get("pdf") as File | null

  if (!file || file.size === 0) {
    return { success: false, error: "Nenhum arquivo PDF enviado." }
  }

  if (!file.name.toLowerCase().endsWith(".pdf")) {
    return { success: false, error: "O arquivo precisa ser um PDF." }
  }

  if (file.size > 10 * 1024 * 1024) {
    return { success: false, error: "O PDF não pode ultrapassar 10 MB." }
  }

  try {
    const buffer = await file.arrayBuffer()
    const text   = await extractTextFromPDF(buffer)

    if (!text.trim()) {
      return { success: false, error: "Não foi possível extrair texto do PDF. Verifique se o arquivo é válido." }
    }

    const { games, warnings } = extractGamesFromText(text)

    if (games.length === 0) {
      return {
        success: false,
        error: "Nenhum jogo encontrado no PDF. Certifique-se de exportar o PDF do FBref em inglês."
      }
    }

    const { data: existingGames, error: fetchError } = await supabaseAdmin
      .from("games")
      .select("home_team, away_team, match_date")

    if (fetchError) {
      return { success: false, error: "Erro ao verificar jogos existentes: " + fetchError.message }
    }

    const existingKeys = new Set(
      (existingGames ?? []).map((g) => `${g.home_team}|${g.away_team}|${new Date(g.match_date).getTime()}`)
    )

    const newGames = games.filter(
      (g) => !existingKeys.has(`${g.home_team}|${g.away_team}|${new Date(g.match_date).getTime()}`)
    )

    const total   = games.length
    const skipped = total - newGames.length

    if (newGames.length === 0) {
      return { success: true, data: { imported: 0, skipped, total, warnings } }
    }

    const { error: insertError } = await supabaseAdmin.from("games").insert(newGames)

    if (insertError) {
      return {
        success: false,
        error: "Erro ao inserir jogos no banco: " + insertError.message
      }
    }

    revalidatePath("/dashboard")
    revalidateAdminViews()

    return { success: true, data: { imported: newGames.length, skipped, total, warnings } }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Erro inesperado ao processar o PDF."
    }
  }
}
