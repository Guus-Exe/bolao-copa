import { getUserPredictions } from "@/app/actions/predictions"
import { GameDashboard } from "@/components/games/GameDashboard"
import { createServerClient } from "@/lib/supabase/server"
import type { Game, Prediction } from "@/types"

export default async function DashboardPage() {
  const supabase = createServerClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  const { data } = await supabase
    .from("profiles")
    .select("username, is_paid, is_admin")
    .eq("id", user?.id ?? "")
    .single()
  const profile = data as {
    username: string
    is_paid: boolean
    is_admin: boolean
  } | null

  if (!profile?.is_paid) {
    return (
      <section className="rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
          Acesso pendente
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-5xl tracking-wide">
          Aguarde a liberaçãoo do admin
        </h1>
        <p className="mt-3 max-w-2xl text-[var(--text-secondary)]">
          Sua conta já existe, mas ainda não foi marcada como paga. Quando o
          admin liberar, os jogos e palpites aparecem aqui.
        </p>
      </section>
    )
  }

  const { data: gamesData } = await supabase
    .from("games")
    .select("*")
    .order("match_date", { ascending: true })

  const predictionsResult = user
    ? await getUserPredictions(user.id)
    : { success: false as const, error: "Você precisa estar logado." }

  const games = (gamesData ?? []) as Game[]
  const predictions = (
    predictionsResult.success ? predictionsResult.data : []
  ) as Prediction[]

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
          Área do participante
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-5xl tracking-wide">
          Jogos da Copa
        </h1>
        <p className="mt-2 text-[var(--text-secondary)]">
          Faça seus palpites até 1 hora antes de cada partida.
        </p>
      </div>

      <GameDashboard games={games} predictions={predictions} />
    </section>
  )
}
