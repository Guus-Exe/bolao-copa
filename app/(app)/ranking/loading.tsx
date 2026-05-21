export default function RankingLoading() {
  return (
    <section className="space-y-8">
      <div>
        <div className="h-4 w-40 rounded bg-[var(--bg-elevated)]" />
        <div className="mt-3 h-16 w-56 rounded bg-[var(--bg-elevated)]" />
        <div className="mt-3 h-5 w-full max-w-xl rounded bg-[var(--bg-elevated)]" />
      </div>

      <div className="grid gap-4 md:grid-cols-3 md:items-end">
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className="h-56 animate-pulse rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)]"
          />
        ))}
      </div>

      <div className="rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] p-4">
        {/* Tres linhas de skeleton para manter a tabela estavel durante o carregamento. */}
        <div className="space-y-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="grid grid-cols-5 gap-4">
              <div className="h-10 rounded bg-[var(--bg-elevated)]" />
              <div className="col-span-2 h-10 rounded bg-[var(--bg-elevated)]" />
              <div className="h-10 rounded bg-[var(--bg-elevated)]" />
              <div className="h-10 rounded bg-[var(--bg-elevated)]" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
