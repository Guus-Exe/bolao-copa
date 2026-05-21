import type { RankingEntry } from "@/types"
import { cn } from "@/lib/utils"
import { RankingAvatar } from "@/components/ranking/RankingAvatar"

type RankingRowProps = {
  entry: RankingEntry
  isCurrentUser: boolean
}

const topPositionClasses: Record<number, string> = {
  1: "bg-yellow-400/15 text-yellow-100 ring-yellow-400/30",
  2: "bg-slate-400/15 text-slate-100 ring-slate-400/30",
  3: "bg-orange-400/15 text-orange-100 ring-orange-400/30"
}

export function RankingRow({ entry, isCurrentUser }: RankingRowProps) {
  return (
    <tr
      className={cn(
        "transition-colors hover:bg-[var(--bg-elevated)]",
        isCurrentUser && "bg-green-500/5 ring-1 ring-inset ring-green-500"
      )}
    >
      <td className="whitespace-nowrap px-4 py-4">
        <span
          className={cn(
            "inline-flex h-9 min-w-9 items-center justify-center rounded-md px-2 text-sm font-black ring-1 ring-[var(--border-strong)]",
            topPositionClasses[entry.position] ?? "bg-[var(--bg-elevated)] text-[var(--text-primary)]"
          )}
        >
          {formatPosition(entry.position)}
        </span>
      </td>
      <td className="min-w-48 px-4 py-4">
        <div className="flex items-center gap-3">
          <RankingAvatar username={entry.username} avatarUrl={entry.avatar_url} size="sm" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate font-semibold text-[var(--text-primary)]">
                {entry.username}
              </span>
              {isCurrentUser ? (
                <span className="rounded-full border border-green-400/30 bg-green-500/10 px-2 py-0.5 text-xs font-bold text-green-100">
                  Voce
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </td>
      <td className="whitespace-nowrap px-4 py-4 text-right text-lg font-black text-green-200">
        {entry.total_points}
      </td>
      <td className="whitespace-nowrap px-4 py-4 text-right font-semibold text-[var(--text-primary)]">
        {entry.total_predictions}
      </td>
      <td className="whitespace-nowrap px-4 py-4 text-right font-semibold text-[var(--text-primary)]">
        {entry.exact_scores}
      </td>
    </tr>
  )
}

export function formatPosition(position: number) {
  return `${position}º`
}
