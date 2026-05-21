import type { RankingEntry } from "@/types"
import { RankingRow } from "@/components/ranking/RankingRow"

type RankingTableProps = {
  entries: RankingEntry[]
  currentUserId: string
  emptyMessage?: string
}

export function RankingTable({
  entries,
  currentUserId,
  emptyMessage = "Sem pessoas no ranking por enquanto."
}: RankingTableProps) {
  if (entries.length === 0) {
    return (
      <section className="rounded-lg border border-dashed border-[var(--border-strong)] bg-[var(--bg-surface)] p-8 text-center text-[var(--text-secondary)]">
        {emptyMessage}
      </section>
    )
  }

  return (
    <section className="overflow-hidden rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)]">
      <div className="max-h-[620px] overflow-auto">
        <table className="w-full min-w-[680px] divide-y divide-[var(--border)]">
          <thead className="sticky top-0 z-10 bg-[var(--bg-elevated)] text-xs uppercase tracking-[0.16em] text-[var(--text-secondary)]">
            <tr>
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Jogador</th>
              <th className="px-4 py-3 text-right">Pontos</th>
              <th className="px-4 py-3 text-right">Palpites</th>
              <th className="px-4 py-3 text-right">Exatos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {entries.map((entry) => (
              <RankingRow
                key={entry.user_id}
                entry={entry}
                isCurrentUser={entry.user_id === currentUserId}
              />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
