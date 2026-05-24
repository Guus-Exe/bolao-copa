import Link from "next/link"

import { getAdminGames, getAdminSummary, getAdminUsers } from "@/lib/queries/admin"
import { StatCards } from "@/components/admin/StatCards"
import { Button } from "@/components/ui/button"
import { CountryFlag } from "@/components/ui/country-flag"

export default async function AdminPage() {
  const [summaryResult, gamesResult, usersResult] = await Promise.all([
    getAdminSummary(),
    getAdminGames(),
    getAdminUsers()
  ])

  if (!summaryResult.success) {
    return <AdminError message={summaryResult.error} />
  }

  const nextGames = gamesResult.success ? gamesResult.data.slice(0, 4) : []
  const pendingUsers = usersResult.success
    ? usersResult.data.filter((user) => !user.is_paid).slice(0, 5)
    : []

  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-300">
            Painel administrativo
          </p>
          <h1 className="mt-2 text-4xl font-bold text-white">
            Operação do bolão
          </h1>
          <p className="mt-2 max-w-2xl text-sky-100">
            Gerencie jogos, resultados e liberacao dos participantes.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild className="bg-sky-500 text-white hover:bg-sky-600">
            <Link href="/admin/jogos">Gerenciar jogos</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/usuarios">Gerenciar usuários</Link>
          </Button>
        </div>
      </header>

      <StatCards summary={summaryResult.data} />

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="rounded-lg border border-sky-500/20 bg-slate-950/55 p-5">
          <h2 className="text-lg font-bold text-white">Proximos jogos</h2>
          <div className="mt-4 space-y-3">
            {nextGames.length > 0 ? (
              nextGames.map((game) => (
                <div
                  key={game.id}
                  className="flex items-center justify-between gap-4 rounded-md border border-sky-500/10 bg-slate-900/50 p-3"
                >
                  <span className="font-semibold text-white flex items-center gap-2">
                    <CountryFlag flag={game.home_flag} name={game.home_team} className="h-4 w-6" />
                    <span>{game.home_team} x {game.away_team}</span>
                    <CountryFlag flag={game.away_flag} name={game.away_team} className="h-4 w-6" />
                  </span>
                  <span className="text-sm text-sky-200">
                    {new Intl.DateTimeFormat("pt-BR", {
                      dateStyle: "short",
                      timeStyle: "short",
                      timeZone: "America/Sao_Paulo"
                    }).format(new Date(game.match_date))}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-sky-200">Nenhum jogo cadastrado.</p>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-sky-500/20 bg-slate-950/55 p-5">
          <h2 className="text-lg font-bold text-white">Acessos pendentes</h2>
          <div className="mt-4 space-y-3">
            {pendingUsers.length > 0 ? (
              pendingUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between gap-4 rounded-md border border-sky-500/10 bg-slate-900/50 p-3"
                >
                  <span className="font-semibold text-white">{user.username}</span>
                  <span className="max-w-[220px] truncate text-sm text-sky-200">
                    {user.email}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-sky-200">Nenhum acesso pendente.</p>
            )}
          </div>
        </section>
      </div>
    </section>
  )
}

function AdminError({ message }: { message: string }) {
  return (
    <section className="rounded-lg border border-red-500/30 bg-red-500/10 p-5 text-red-100">
      {message}
    </section>
  )
}
