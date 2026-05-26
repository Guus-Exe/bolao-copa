import { getAdminGames } from "@/lib/queries/admin"

export const dynamic = "force-dynamic"
import { GameTable } from "@/components/admin/GameTable"

export default async function AdminGamesPage() {
  const result = await getAdminGames()

  if (!result.success) {
    return (
      <section className="rounded-lg border border-red-500/30 bg-red-500/10 p-5 text-red-100">
        {result.error}
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-300">
          Painel administrativo
        </p>
        <h1 className="mt-2 text-4xl font-bold text-white">Jogos</h1>
      </header>

      <GameTable games={result.data} />
    </section>
  )
}
