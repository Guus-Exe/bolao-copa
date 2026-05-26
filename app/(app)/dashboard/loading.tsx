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

      {/* Lista de jogos */}
      <div className="space-y-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] p-4"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-1 items-center justify-end gap-3">
                <div className="h-5 w-28 rounded bg-[var(--bg-elevated)]" />
                <div className="h-8 w-8 rounded-full bg-[var(--bg-elevated)]" />
              </div>
              <div className="h-8 w-16 shrink-0 rounded bg-[var(--bg-elevated)]" />
              <div className="flex flex-1 items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-[var(--bg-elevated)]" />
                <div className="h-5 w-28 rounded bg-[var(--bg-elevated)]" />
              </div>
            </div>
            <div className="mt-3 flex justify-center">
              <div className="h-4 w-32 rounded bg-[var(--bg-elevated)]" />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
