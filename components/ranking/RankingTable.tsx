import type { RankingEntry } from "@/types"
import { RankingRow, formatPosition, topPositionClasses } from "@/components/ranking/RankingRow"
import { RankingAvatar } from "@/components/ranking/RankingAvatar"
import { cn } from "@/lib/utils"
import { TiebreakerInfo } from "@/components/ranking/TiebreakerInfo"

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
    <>
      <section className="hidden md:block overflow-hidden rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)]">
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

      <section className="md:hidden flex flex-col gap-3">
        {entries.map((entry) => {
          const isCurrentUser = entry.user_id === currentUserId
          return (
            <div
              key={entry.user_id}
              className={cn(
                "flex flex-col gap-3 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] p-4",
                isCurrentUser && "bg-green-500/5 ring-1 ring-inset ring-green-500"
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "inline-flex h-9 min-w-9 items-center justify-center rounded-md px-2 text-sm font-black ring-1 ring-[var(--border-strong)]",
                    topPositionClasses[entry.position] ?? "bg-[var(--bg-elevated)] text-[var(--text-primary)]"
                  )}
                >
                  {formatPosition(entry.position)}
                </span>
                <RankingAvatar username={entry.username} avatarUrl={entry.avatar_url} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate font-semibold text-[var(--text-primary)]">
                      {entry.username}
                    </span>
                    {isCurrentUser ? (
                      <span className="rounded-full border border-green-400/30 bg-green-500/10 px-2 py-0.5 text-xs font-bold text-green-100">
                        Você
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 border-t border-[var(--border-strong)] pt-3 text-center">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider mb-0.5">Pontos</span>
                  <div className="flex items-center gap-1.5">
                    <TiebreakerInfo entry={entry} />
                    <span className="text-lg font-black text-green-200">{entry.total_points}</span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">Palpites</span>
                  <span className="font-semibold text-[var(--text-primary)]">{entry.total_predictions}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">Exatos</span>
                  <span className="font-semibold text-[var(--text-primary)]">{entry.exact_scores}</span>
                </div>
              </div>
            </div>
          )
        })}
      </section>
    </>
  )
}
