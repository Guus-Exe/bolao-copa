export default function DashboardLoading() {
  return (
    <section className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <div className="h-4 w-40 animate-pulse rounded bg-[var(--bg-elevated)]" />
          <div className="h-12 w-52 animate-pulse rounded bg-[var(--bg-elevated)]" />
          <div className="h-4 w-72 animate-pulse rounded bg-[var(--bg-elevated)]" />
        </div>
        <div className="h-28 w-full animate-pulse rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] md:max-w-[320px]" />
      </div>

      {/* Barra de Progresso e Filtros */}
      <div className="flex flex-col gap-4 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] p-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2 w-full max-w-xs animate-pulse">
          <div className="h-4 w-32 rounded bg-[var(--bg-elevated)]" />
          <div className="h-2 w-full rounded-full bg-[var(--bg-elevated)]" />
        </div>
        <div className="flex flex-col gap-3 md:items-end animate-pulse">
          <div className="h-8 w-64 rounded bg-[var(--bg-elevated)]" />
          <div className="h-8 w-72 rounded bg-[var(--bg-elevated)]" />
        </div>
      </div>

      {/* Fase Header Skeleton */}
      <div className="space-y-3">
        <div className="h-8 w-36 animate-pulse rounded bg-[var(--bg-elevated)]" />
        
        {/* Grid de jogos */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] p-5 space-y-5"
            >
              {/* Top info */}
              <div className="flex items-center justify-between">
                <div className="h-6 w-20 rounded-full bg-[var(--bg-elevated)]" />
                <div className="h-4 w-16 rounded bg-[var(--bg-elevated)]" />
              </div>

              {/* Teams Block */}
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <div className="flex flex-col items-start gap-2">
                  <div className="h-7 w-10 rounded bg-[var(--bg-elevated)]" />
                  <div className="h-4 w-20 rounded bg-[var(--bg-elevated)]" />
                </div>
                <div className="h-4 w-4 rounded bg-[var(--bg-elevated)]" />
                <div className="flex flex-col items-end gap-2">
                  <div className="h-7 w-10 rounded bg-[var(--bg-elevated)]" />
                  <div className="h-4 w-20 rounded bg-[var(--bg-elevated)]" />
                </div>
              </div>

              {/* Date & Countdown */}
              <div className="flex items-center justify-between">
                <div className="h-4 w-32 rounded bg-[var(--bg-elevated)]" />
                <div className="h-4 w-24 rounded bg-[var(--bg-elevated)]" />
              </div>

              {/* Prediction Form box */}
              <div className="rounded-lg bg-green-950/10 p-4 space-y-4">
                <div className="h-3 w-16 rounded bg-[var(--bg-elevated)]" />
                <div className="flex items-center justify-center gap-6">
                  <div className="h-16 w-16 rounded-md bg-[var(--bg-elevated)]" />
                  <div className="h-6 w-4 rounded bg-[var(--bg-elevated)]" />
                  <div className="h-16 w-16 rounded-md bg-[var(--bg-elevated)]" />
                </div>
                <div className="h-10 w-full rounded bg-[var(--bg-elevated)]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
