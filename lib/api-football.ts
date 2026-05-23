// =============================================================
// API-Football v3 — Cliente para a Copa do Mundo 2026
// =============================================================
// Docs: https://www.api-football.com/documentation-v3
// Base URL: https://v3.football.api-sports.io
// Header: x-apisports-key
// =============================================================

// Copa do Mundo — IDs fixos da API
export const WORLD_CUP_LEAGUE_ID = 1
// Nota: O plano gratuito da API-Football não permite acessar temporadas futuras (ex: 2026).
// Estamos usando 2022 temporariamente para testar a integração. Mude para 2026 depois.
export const WORLD_CUP_SEASON = 2022


// --------------- Tipos ---------------

/** Resposta mínima usada por syncGameScore / cron (já existia) */
export type ApiFixtureResponse = {
  fixture: {
    id: number
    status: {
      long: string
      short: string
      elapsed: number | null
    }
  }
  goals: {
    home: number | null
    away: number | null
  }
}

/** Resposta completa com times, liga e data — usada na importação em lote */
export type ApiFixtureFull = {
  fixture: {
    id: number
    date: string
    status: {
      long: string
      short: string
      elapsed: number | null
    }
  }
  league: {
    id: number
    name: string
    round: string
  }
  teams: {
    home: { id: number; name: string; logo: string }
    away: { id: number; name: string; logo: string }
  }
  goals: {
    home: number | null
    away: number | null
  }
}

// --------------- Helpers ---------------

function getApiKey(): string {
  const apiKey = process.env.API_FOOTBALL_KEY
  if (!apiKey) {
    throw new Error("API_FOOTBALL_KEY não está configurada no ambiente.")
  }
  return apiKey
}

async function apiFetch<T>(endpoint: string): Promise<T[]> {
  const apiKey = getApiKey()

  const response = await fetch(
    `https://v3.football.api-sports.io${endpoint}`,
    {
      headers: { "x-apisports-key": apiKey },
      cache: "no-store"
    }
  )

  if (!response.ok) {
    throw new Error(`Erro na API-Football (HTTP ${response.status})`)
  }

  const data = await response.json()

  if (data.errors && Object.keys(data.errors).length > 0) {
    throw new Error(
      "Erro retornado pela API-Football: " + JSON.stringify(data.errors)
    )
  }

  return data.response as T[]
}

// --------------- Funções públicas ---------------

/**
 * Busca fixtures por IDs individuais (até 20 separados por hífen).
 * Usada por syncGameScore() e pelo cron job.
 */
export async function fetchFixtures(
  fixtureIds: number[]
): Promise<ApiFixtureResponse[]> {
  if (fixtureIds.length === 0) return []

  const idsParam = fixtureIds.join("-")
  return apiFetch<ApiFixtureResponse>(`/fixtures?ids=${idsParam}`)
}

/**
 * Busca TODOS os jogos da Copa do Mundo 2026.
 * Usada para importação em lote dos jogos.
 * Consome 1 requisição na API.
 */
export async function fetchAllWorldCupFixtures(): Promise<ApiFixtureFull[]> {
  return apiFetch<ApiFixtureFull>(
    `/fixtures?league=${WORLD_CUP_LEAGUE_ID}&season=${WORLD_CUP_SEASON}`
  )
}

/**
 * Busca jogos da Copa numa data específica (formato YYYY-MM-DD).
 * Usada pelo cron como alternativa mais eficiente.
 * Consome 1 requisição na API.
 */
export async function fetchFixturesByDate(
  date: string
): Promise<ApiFixtureFull[]> {
  return apiFetch<ApiFixtureFull>(
    `/fixtures?league=${WORLD_CUP_LEAGUE_ID}&season=${WORLD_CUP_SEASON}&date=${date}`
  )
}
