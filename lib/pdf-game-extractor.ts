/**
 * lib/pdf-game-extractor.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Extrai jogos da Copa do Mundo de um PDF exportado do FBref.com em inglês.
 *
 * Funciona tanto no servidor Next.js (Vercel) quanto localmente.
 * Não depende de Python — usa a lib `unpdf` para extrair texto.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── Flags ────────────────────────────────────────────────────────────────────

const FLAGS: Record<string, string> = {
  Morocco: "🇲🇦",
  USA: "🇺🇸",
  Mexico: "🇲🇽",
  Canada: "🇨🇦",
  Brazil: "🇧🇷",
  Argentina: "🇦🇷",
  France: "🇫🇷",
  England: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  Spain: "🇪🇸",
  Germany: "🇩🇪",
  Portugal: "🇵🇹",
  Netherlands: "🇳🇱",
  Belgium: "🇧🇪",
  Croatia: "🇭🇷",
  Uruguay: "🇺🇾",
  Colombia: "🇨🇴",
  Japan: "🇯🇵",
  "South Korea": "🇰🇷",
  Australia: "🇦🇺",
  "Saudi Arabia": "🇸🇦",
  Iran: "🇮🇷",
  Qatar: "🇶🇦",
  Ecuador: "🇪🇨",
  Senegal: "🇸🇳",
  Ghana: "🇬🇭",
  Tunisia: "🇹🇳",
  Egypt: "🇪🇬",
  Algeria: "🇩🇿",
  "Ivory Coast": "🇨🇮",
  Switzerland: "🇨🇭",
  Scotland: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  Sweden: "🇸🇪",
  Austria: "🇦🇹",
  "Czech Republic": "🇨🇿",
  Turkey: "🇹🇷",
  Paraguay: "🇵🇾",
  Panama: "🇵🇦",
  "Bosnia and Herzegovina": "🇧🇦",
  "DR Congo": "🇨🇩",
  Norway: "🇳🇴",
  "Cape Verde": "🇨🇻",
  Haiti: "🇭🇹",
  Curacao: "🇨🇼",
  "South Africa": "🇿🇦",
  "New Zealand": "🇳🇿",
  Uzbekistan: "🇺🇿",
  Iraq: "🇮🇶",
  Jordan: "🇯🇴",
  Serbia: "🇷🇸",
  Denmark: "🇩🇰",
  Poland: "🇵🇱",
  Wales: "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
  Ukraine: "🇺🇦",
  "Costa Rica": "🇨🇷",
  Chile: "🇨🇱",
  Peru: "🇵🇪",
  Venezuela: "🇻🇪",
  Bolivia: "🇧🇴",
  Honduras: "🇭🇳",
  Jamaica: "🇯🇲",
  China: "🇨🇳",
  Indonesia: "🇮🇩",
  Thailand: "🇹🇭",
  Vietnam: "🇻🇳",
  Cameroon: "🇨🇲",
  Nigeria: "🇳🇬",
  "Burkina Faso": "🇧🇫",
  Mali: "🇲🇱",
}

// Aliases: como o FBref escreve → nome canônico no projeto
const NORMALIZE: Record<string, string> = {
  "United States": "USA",
  "Korea Republic": "South Korea",
  Türkiye: "Turkey",
  Turkiye: "Turkey",
  "Congo DR": "DR Congo",
  "Côte d'Ivoire": "Ivory Coast",
  "Cote d'Ivoire": "Ivory Coast",
  "Curaçao": "Curacao",
  Czechia: "Czech Republic",
  "Czech Rep.": "Czech Republic",
  "IR Iran": "Iran",
  "Bosnia-Herzegovina": "Bosnia and Herzegovina",
}
function getFlag(team: string): string {
  return FLAGS[team] ?? "🏳️"
}

// ─── Tradução inglês → português ─────────────────────────────────────────────

/**
 * Traduz o nome do time (inglês, como vem do FBref) para português.
 * As chaves devem corresponder aos nomes canônicos usados em FLAGS.
 */
const EN_TO_PT: Record<string, string> = {
  // América do Norte e Central
  USA:                       "Estados Unidos",
  Canada:                    "Canadá",
  Mexico:                    "México",
  Honduras:                  "Honduras",
  Panama:                    "Panamá",
  "Costa Rica":              "Costa Rica",
  Jamaica:                   "Jamaica",
  Haiti:                     "Haiti",
  Curacao:                   "Curaçao",
  // América do Sul
  Brazil:                    "Brasil",
  Argentina:                 "Argentina",
  Uruguay:                   "Uruguai",
  Colombia:                  "Colômbia",
  Ecuador:                   "Equador",
  Paraguay:                  "Paraguai",
  Chile:                     "Chile",
  Peru:                      "Peru",
  Venezuela:                 "Venezuela",
  Bolivia:                   "Bolívia",
  // Europa
  France:                    "França",
  England:                   "Inglaterra",
  Spain:                     "Espanha",
  Germany:                   "Alemanha",
  Portugal:                  "Portugal",
  Netherlands:               "Países Baixos",
  Belgium:                   "Bélgica",
  Croatia:                   "Croácia",
  Switzerland:               "Suíça",
  Scotland:                  "Escócia",
  Wales:                     "País de Gales",
  Sweden:                    "Suécia",
  Austria:                   "Áustria",
  "Czech Republic":          "República Tcheca",
  Turkey:                    "Turquia",
  "Bosnia and Herzegovina":  "Bósnia-Herzegovina",
  Serbia:                    "Sérvia",
  Denmark:                   "Dinamarca",
  Poland:                    "Polônia",
  Ukraine:                   "Ucrânia",
  Norway:                    "Noruega",
  // África
  Morocco:                   "Marrocos",
  "South Africa":            "África do Sul",
  "DR Congo":                "Rep. Dem. do Congo",
  "Ivory Coast":             "Costa do Marfim",
  Senegal:                   "Senegal",
  Ghana:                     "Gana",
  Tunisia:                   "Tunísia",
  Egypt:                     "Egito",
  Algeria:                   "Argélia",
  Nigeria:                   "Nigéria",
  Cameroon:                  "Camarões",
  "Burkina Faso":            "Burkina Faso",
  Mali:                      "Mali",
  "Cape Verde":              "Cabo Verde",
  // Ásia e Oceania
  Japan:                     "Japão",
  "South Korea":             "Coreia do Sul",
  Australia:                 "Austrália",
  "Saudi Arabia":            "Arábia Saudita",
  Iran:                      "Irã",
  Qatar:                     "Catar",
  Iraq:                      "Iraque",
  Jordan:                    "Jordânia",
  Uzbekistan:                "Uzbequistão",
  "New Zealand":             "Nova Zelândia",
  China:                     "China",
  Indonesia:                 "Indonésia",
  Thailand:                  "Tailândia",
  Vietnam:                   "Vietnã",
}

/** Retorna o nome em português, ou o próprio nome caso não haja tradução. */
function toPT(teamEn: string): string {
  return EN_TO_PT[teamEn] ?? teamEn
}

// Lista de times ordenada do nome mais longo para o mais curto
// (evita que "South Korea" seja capturado parcialmente como "Korea")
const ALL_TEAMS: string[] = Object.keys({ ...FLAGS, ...NORMALIZE }).sort(
  (a, b) => b.length - a.length
)



// ─── Detecção de fase ─────────────────────────────────────────────────────────

function detectStage(line: string): string | null {
  const t = line.toLowerCase()
  if (t.includes("round of 16") || t.includes("round of sixteen")) return "oitavas"
  if (t.includes("quarter")) return "quartas"
  if (t.includes("semi")) return "semi"
  if (t.includes("third") || t.includes("3rd place")) return "final"
  if (t.includes("final")) return "final"
  if (t.includes("group")) return "grupo"
  return null
}

// ─── Detecção de times na linha ───────────────────────────────────────────────

function findTeams(text: string): [string, string] | null {
  const found: Array<{ pos: number; name: string }> = []
  let remaining = text

  for (const team of ALL_TEAMS) {
    const re = new RegExp(`\\b${team.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i")
    const match = re.exec(remaining)
    if (match) {
      const canonical = NORMALIZE[team] ?? team
      found.push({ pos: match.index, name: canonical })
      // Apaga o time encontrado para não capturar novamente
      remaining =
        remaining.slice(0, match.index) +
        " ".repeat(match[0].length) +
        remaining.slice(match.index + match[0].length)
    }
  }

  if (found.length < 2) return null

  // Ordena por posição: primeiro = mandante, segundo = visitante
  found.sort((a, b) => a.pos - b.pos)
  return [found[0].name, found[1].name]
}

// ─── Regex de parsing ────────────────────────────────────────────────────────

// O PDF é extraído como uma linha contínua sem quebras de linha (\n).
// Capturamos a data e a hora UTC (ignorando a hora local).
const GAME_PATTERN = /(\d{4}-\d{2}-\d{2})\s+\d{2}:\d{2}\s+\((\d{2}:\d{2})\)/g;

// ─── Tipos exportados ─────────────────────────────────────────────────────────

export type ExtractedGame = {
  home_team: string
  away_team: string
  home_flag: string
  away_flag: string
  match_date: string // ISO 8601 UTC
  stage: string
  group_name: null
  home_score: null
  away_score: null
  is_finished: false
}

export type ExtractionResult = {
  games: ExtractedGame[]
  warnings: string[]
}

// ─── Função principal ─────────────────────────────────────────────────────────

/**
 * Extrai os jogos de um texto bruto extraído de um PDF FBref (em inglês).
 *
 * @param rawText - Texto completo do PDF (todas as páginas concatenadas)
 * @returns Lista de jogos extraídos + avisos para times não reconhecidos
 */
export function extractGamesFromText(rawText: string): ExtractionResult {
  const games: ExtractedGame[] = []
  const warnings: string[] = []
  let currentStage = "grupo"

  // parts = [ "texto inicial", "2026-06-11", "16:00", " Mexico mx za South Africa...", ... ]
  const parts = rawText.split(GAME_PATTERN);
  const numGames = (parts.length - 1) / 3;

  for (let i = 0; i < numGames; i++) {
    const dateStr = parts[i * 3 + 1];
    const utcTime = parts[i * 3 + 2];
    const rest    = parts[i * 3 + 3].trim();
    const prevText = parts[i * 3]; // Texto antes do jogo (pode conter a fase)

    // Tenta atualizar a fase olhando o texto anterior ou o restante
    const detectedStage = detectStage(prevText) || detectStage(rest);
    if (detectedStage) currentStage = detectedStage;

    const teams = findTeams(rest)
    if (!teams) {
      warnings.push(`Linha ignorada (times não identificados): ${rest.slice(0, 100)}`)
      continue
    }

    const [homeEn, awayEn] = teams

    if (!FLAGS[homeEn]) warnings.push(`Bandeira não encontrada para: "${homeEn}"`)
    if (!FLAGS[awayEn]) warnings.push(`Bandeira não encontrada para: "${awayEn}"`)

    games.push({
      home_team:   toPT(homeEn),
      away_team:   toPT(awayEn),
      home_flag:   getFlag(homeEn),
      away_flag:   getFlag(awayEn),
      match_date:  `${dateStr}T${utcTime}:00-03:00`,
      stage:       currentStage,
      group_name:  null,
      home_score:  null,
      away_score:  null,
      is_finished: false,
    })
  }

  return { games, warnings }
}

/**
 * Converte um ArrayBuffer (do PDF) em texto extraído.
 * Usa a lib `unpdf` — funciona no servidor Next.js e na Vercel.
 */
export async function extractTextFromPDF(buffer: ArrayBuffer): Promise<string> {
  const { extractText } = await import("unpdf")
  const uint8 = new Uint8Array(buffer)
  const { text } = await extractText(uint8, { mergePages: true })
  return text ?? ""
}
