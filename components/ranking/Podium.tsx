import type { RankingEntry } from "@/types"
import { RankingAvatar } from "@/components/ranking/RankingAvatar"
import { cn } from "@/lib/utils"
import { TiebreakerInfo } from "@/components/ranking/TiebreakerInfo"

type PodiumProps = {
  entries: RankingEntry[]
}

const podiumConfig = {
  1: {
    medal: "1",
    label: "1° lugar",
    className: "border-yellow-400/30 bg-yellow-400/10",
    pointsClassName: "text-yellow-200"
  },
  2: {
    medal: "2",
    label: "2° lugar",
    className: "border-slate-400/30 bg-slate-400/10",
    pointsClassName: "text-slate-100"
  },
  3: {
    medal: "3",
    label: "3° lugar",
    className: "border-orange-400/30 bg-orange-400/10",
    pointsClassName: "text-orange-100"
  },
  4: {
    medal: "4",
    label: "4° lugar",
    className: "border-green-400/30 bg-green-400/10",
    pointsClassName: "text-green-100"
  }
}

export function Podium({ entries }: PodiumProps) {
  const slots = [1, 2, 3, 4].map((slot) => ({
    slot: slot as 1 | 2 | 3 | 4,
    entry: entries[slot - 1]
  }))

  if (entries.length === 0) {
    return (
      <section className="rounded-lg border border-dashed border-[var(--border-strong)] bg-[var(--bg-surface)] p-8 text-center text-[var(--text-secondary)]">
        Sem pessoas no ranking por enquanto.
      </section>
    )
  }

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {slots.map(({ slot, entry }, index) => {
        const config = podiumConfig[slot]

        if (!entry) {
          return (
            <div
              key={slot}
              className="hidden min-h-48 rounded-lg border border-dashed border-[var(--border-strong)] bg-[var(--bg-surface)] sm:block"
            />
          )
        }

        return (
          <article
            key={entry.user_id}
            className={cn(
              "animate-fade-slide rounded-lg border p-5 text-center shadow-lg shadow-black/10",
              config.className
            )}
            style={{ animationDelay: `${index * 90}ms` }}
          >
            <div
              className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-current text-2xl font-black"
              aria-hidden="true"
            >
              {config.medal}
            </div>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
              {config.label}
            </p>
            <div className="mt-4 flex justify-center">
              <RankingAvatar
                username={entry.username}
                avatarUrl={entry.avatar_url}
                size={slot <= 2 ? "lg" : "md"}
              />
            </div>
            <h2 className="mt-3 truncate text-lg font-bold text-[var(--text-primary)]">
              {entry.username}
            </h2>
            <div className="mt-2 flex flex-col items-center">
              <div className="flex items-center justify-center gap-1.5">
                <p
                  className={cn(
                    "text-3xl font-black",
                    config.pointsClassName
                  )}
                >
                  {entry.total_points}
                </p>
                <TiebreakerInfo entry={entry} />
              </div>
              <p className="text-sm text-[var(--text-secondary)] mt-0.5">pontos</p>
            </div>
            <p className="mt-2 text-xs text-[var(--text-secondary)]">
              {entry.exact_scores} exatos
            </p>
          </article>
        )
      })}
    </section>
  )
}
