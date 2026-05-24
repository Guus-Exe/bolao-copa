import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AdminLoading() {
  return (
    <section className="space-y-8 animate-in fade-in duration-300">
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

      {/* StatCards Skeleton */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <article
            key={i}
            className="rounded-lg border border-sky-500/20 bg-slate-950/55 p-5 shadow-[0_0_24px_rgba(14,165,233,0.08)]"
          >
            <div className="flex items-center justify-between gap-4">
              <Skeleton className="h-4 w-28 bg-sky-500/20" />
              <Skeleton className="h-9 w-9 rounded-md bg-sky-500/20" />
            </div>
            <Skeleton className="mt-4 h-9 w-12 bg-sky-500/20" />
          </article>
        ))}
      </section>

      {/* Lists Skeleton */}
      <div className="grid gap-4 xl:grid-cols-2">
        <section className="rounded-lg border border-sky-500/20 bg-slate-950/55 p-5">
          <h2 className="text-lg font-bold text-white">Proximos jogos</h2>
          <div className="mt-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-4 rounded-md border border-sky-500/10 bg-slate-900/50 p-3"
              >
                <Skeleton className="h-5 w-48 bg-sky-500/20" />
                <Skeleton className="h-4 w-24 bg-sky-500/20" />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-sky-500/20 bg-slate-950/55 p-5">
          <h2 className="text-lg font-bold text-white">Acessos pendentes</h2>
          <div className="mt-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-4 rounded-md border border-sky-500/10 bg-slate-900/50 p-3"
              >
                <Skeleton className="h-5 w-32 bg-sky-500/20" />
                <Skeleton className="h-4 w-48 bg-sky-500/20" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  )
}
