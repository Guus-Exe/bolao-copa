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

export async function fetchFixtures(
  fixtureIds: number[]
): Promise<ApiFixtureResponse[]> {
  if (fixtureIds.length === 0) return []

  const idsParam = fixtureIds.join("-")
  const apiKey = process.env.API_FOOTBALL_KEY

  if (!apiKey) {
    throw new Error("API_FOOTBALL_KEY nao esta configurada no ambiente.")
  }

  const response = await fetch(
    `https://v3.football.api-sports.io/fixtures?ids=${idsParam}`,
    {
      headers: {
        "x-apisports-key": apiKey
      },
      // Desabilita cache para pegar o resultado mais atualizado
      cache: "no-store"
    }
  )

  if (!response.ok) {
    throw new Error("Erro na comunicacao com a API-Football")
  }

  const data = await response.json()

  if (data.errors && Object.keys(data.errors).length > 0) {
    throw new Error("Erro retornado pela API-Football: " + JSON.stringify(data.errors))
  }

  return data.response
}
