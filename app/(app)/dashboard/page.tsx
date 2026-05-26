import Link from "next/link"
import { UsersRound } from "lucide-react"
import { GameDashboard } from "@/components/games/GameDashboard"
import { createServerClient } from "@/lib/supabase/server"
import type { Prediction } from "@/types"
import { getCachedGames } from "@/lib/queries/games"

import { PendingAccess } from "@/components/PendingAccess"

export default async function DashboardPage() {
  const supabase = createServerClient()

  // Passo 1: Busca o usuário autenticado e obtém os jogos do cache em paralelo
  const [userResult, games] = await Promise.all([
    supabase.auth.getUser(),
    getCachedGames()
  ])

  const user = userResult.data.user

  // Passo 2: Busca o perfil do usuário logado e seus palpites em uma única query (Join PostgREST)
  const { data: profileData } = user
    ? await supabase
        .from("profiles")
        .select("username, is_paid, is_admin, predictions(*)")
        .eq("id", user.id)
        .single()
    : { data: null }

  const profile = profileData as {
    username: string
    is_paid: boolean
    is_admin: boolean
    predictions: Prediction[]
  } | null

  if (!profile?.is_paid) {
    return <PendingAccess />
  }

  // Passo 3: Se for administrador, busca usuários pendentes de acesso
  let pendingUsersCount = 0
  if (profile?.is_admin) {
    const { count } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("is_paid", false)
    pendingUsersCount = count ?? 0
  }

  const predictions = profile.predictions ?? []


  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
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

        <div className="w-full shrink-0 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] p-4 text-sm md:max-w-[320px]">
          <h2 className="mb-3 font-[family-name:var(--font-display)] text-xl tracking-wide text-[var(--text-primary)]">
            Regras de pontuação
          </h2>
          <ul className="space-y-2 text-[var(--text-secondary)]">
            <li className="flex items-center justify-between border-b border-[var(--border-strong)] pb-1 last:border-0 last:pb-0">
              <span>Placar exato</span>
              <strong className="text-green-400">3 pts</strong>
            </li>
            <li className="flex items-center justify-between border-b border-[var(--border-strong)] pb-1 last:border-0 last:pb-0">
              <span>Acertou o vencedor</span>
              <strong className="text-green-400">1 pt</strong>
            </li>
          </ul>
        </div>
      </div>

      {profile?.is_admin && pendingUsersCount > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 text-amber-200">
          <div className="flex items-center gap-3">
            <UsersRound className="text-amber-500 shrink-0" size={20} />
            <p className="text-sm">
              <strong>Admin:</strong> Há {pendingUsersCount} {pendingUsersCount === 1 ? "usuário aguardando" : "usuários aguardando"} liberação de acesso.
            </p>
          </div>
          <Link
            href="/admin/usuarios"
            className="inline-flex shrink-0 items-center justify-center rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-sm font-medium text-amber-200 transition-colors hover:bg-amber-500/20 hover:text-amber-100"
          >
            Ver Usuários
          </Link>
        </div>
      )}

      <GameDashboard games={games} predictions={predictions} />
    </section>
  )
}
