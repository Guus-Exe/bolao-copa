export default function AdminControlLoading() {
  return (
    <section className="space-y-6">
      <header>
        <div className="h-4 w-44 animate-pulse rounded bg-[var(--bg-elevated)]" />
        <div className="mt-3 h-10 w-80 max-w-full animate-pulse rounded bg-[var(--bg-elevated)]" />
        <div className="mt-3 h-5 w-[28rem] max-w-full animate-pulse rounded bg-[var(--bg-elevated)]" />
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {["total", "liberados", "pendentes"].map((item) => (
          <article
            key={item}
            className="rounded-lg border border-sky-500/20 bg-slate-950/55 p-5"
          >
            <div className="h-4 w-36 animate-pulse rounded bg-[var(--bg-elevated)]" />
            <div className="mt-4 h-9 w-16 animate-pulse rounded bg-[var(--bg-elevated)]" />
          </article>
        ))}
      </div>

      <div className="rounded-lg border border-sky-500/20 bg-slate-950/55 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="h-10 w-72 animate-pulse rounded bg-[var(--bg-elevated)]" />
          <div className="h-10 w-96 max-w-full animate-pulse rounded bg-[var(--bg-elevated)]" />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-sky-500/20 bg-slate-950/55">
        <div className="grid min-w-[860px] grid-cols-[1.4fr_1.2fr_0.8fr_0.7fr_0.9fr] gap-4 border-b border-sky-500/20 p-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-4 animate-pulse rounded bg-[var(--bg-elevated)]"
            />
          ))}
        </div>
        {/* Cinco linhas preservam a altura da tabela enquanto os dados chegam. */}
        {Array.from({ length: 5 }).map((_, row) => (
          <div
            key={row}
            className="grid min-w-[860px] grid-cols-[1.4fr_1.2fr_0.8fr_0.7fr_0.9fr] gap-4 border-b border-sky-500/10 p-4 last:border-b-0"
          >
            {Array.from({ length: 5 }).map((_, cell) => (
              <div
                key={cell}
                className="h-5 animate-pulse rounded bg-[var(--bg-elevated)]"
              />
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}
