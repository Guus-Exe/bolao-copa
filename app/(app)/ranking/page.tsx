import { Podium } from "@/components/ranking/Podium"
import { RankingTable } from "@/components/ranking/RankingTable"
import { UserHighlight } from "@/components/ranking/UserHighlight"
import { getRankingEntries } from "@/lib/queries/ranking"
import { createServerClient } from "@/lib/supabase/server"

export const revalidate = 60

export default async function RankingPage() {
  const supabase = createServerClient()

  // Passo 1: Busca o usuário e o ranking em paralelo (getRankingEntries é cacheado)
  const [userResult, rankingResult] = await Promise.all([
    supabase.auth.getUser(),
    getRankingEntries()
  ])

  const user = userResult.data.user

  // Passo 2: Busca perfil do usuário para verificar se é administrador
  const { data: profileData } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user?.id ?? "")
    .single()

  const profile = profileData as { is_admin: boolean } | null
  const isAdmin = Boolean(profile?.is_admin)

  const { ranking, error } = rankingResult
  const awardedRanking = ranking.slice(0, 4)
  const remainingRanking = ranking.slice(4)

  const currentUserId = user?.id ?? ""
  const currentUserEntry =
    ranking.find((entry) => entry.user_id === currentUserId) ?? null

  return (
    <section className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
          Classificação geral
        </p>
        <h1 className="mt-2 bg-gradient-to-r from-green-300 via-green-100 to-yellow-300 bg-clip-text font-[family-name:var(--font-display)] text-6xl tracking-wide text-transparent md:text-7xl">
          Ranking
        </h1>
        <p className="mt-2 max-w-2xl text-[var(--text-secondary)]">
          Pontos acumulados, palpites feitos e placares exatos dos usuários.
        </p>
      </div>

      {error && isAdmin ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">
          Não foi possível carregar o ranking. Verifique perfis, palpites e jogos no Supabase.
        </div>
      ) : error ? (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
          Não foi possível carregar o ranking no momento. Tente novamente em instantes.
        </div>
      ) : null}

      <Podium entries={awardedRanking} />

      <div className="space-y-4">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-4xl tracking-wide">
            Demais participantes
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            A partir do 5° lugar, a classificação continua na tabela.
          </p>
        </div>
        <RankingTable
          entries={remainingRanking}
          currentUserId={currentUserId}
          emptyMessage="Nenhum participante fora da premiação por enquanto."
        />
      </div>

      <UserHighlight entry={currentUserEntry} />
    </section>
  )
}
