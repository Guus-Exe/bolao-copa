import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"

export default function AdminUsersLoading() {
  return (
    <section className="space-y-6 animate-in fade-in duration-300">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-300">
          Painel administrativo
        </p>
        <h1 className="mt-2 text-4xl font-bold text-white">Usuários</h1>
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

      <div className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Gerenciar usuários</h2>
            <p className="text-sm text-sky-200">
              Libere acessos, revise admins e acompanhe palpites.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {["Todos", "Com acesso", "Sem acesso", "Admins"].map((label, i) => (
              <Button
                key={label}
                disabled
                variant={i === 0 ? "default" : "outline"}
                size="sm"
                className={i === 0 ? "bg-sky-500 text-white opacity-50" : "opacity-50"}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        <div className="hidden md:block overflow-hidden rounded-lg border border-sky-500/20 bg-slate-950/55">
          <div className="border-b border-sky-500/20 p-4 flex gap-4">
            <Skeleton className="h-5 w-12 bg-sky-500/20" />
            <Skeleton className="h-5 w-32 bg-sky-500/20" />
            <Skeleton className="h-5 w-48 bg-sky-500/20" />
            <Skeleton className="h-5 w-32 bg-sky-500/20 ml-auto" />
          </div>
          <div className="divide-y divide-sky-500/10">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <Skeleton className="h-10 w-10 rounded-full bg-sky-500/20" />
                <Skeleton className="h-5 w-32 bg-sky-500/20" />
                <Skeleton className="h-5 w-48 bg-sky-500/20" />
                <Skeleton className="h-5 w-24 bg-sky-500/20" />
                <Skeleton className="h-6 w-16 rounded-full bg-sky-500/20" />
                <Skeleton className="h-6 w-16 rounded-full bg-sky-500/20" />
                <div className="flex gap-2 ml-auto">
                  <Skeleton className="h-8 w-8 rounded-md bg-sky-500/20" />
                  <Skeleton className="h-8 w-8 rounded-md bg-sky-500/20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
