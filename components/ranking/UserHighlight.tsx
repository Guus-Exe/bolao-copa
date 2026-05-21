import type { RankingEntry } from "@/types"
import { RankingAvatar } from "@/components/ranking/RankingAvatar"
import { formatPosition } from "@/components/ranking/RankingRow"

type UserHighlightProps = {
  entry: RankingEntry | null
}

export function UserHighlight({ entry }: UserHighlightProps) {
  if (!entry) {
    return null
  }

  const accuracy = entry.total_predictions
    ? Math.round((entry.exact_scores / entry.total_predictions) * 100)
    : 0

  return (
    <aside className="sticky bottom-4 z-20 rounded-lg border border-green-500/30 bg-green-500/10 p-4 shadow-xl shadow-black/20 backdrop-blur">
      {/* Resumo sempre visivel para o usuario se localizar na classificacao. */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <RankingAvatar username={entry.username} avatarUrl={entry.avatar_url} size="sm" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green-100">
              Sua posicao
            </p>
            <p className="font-semibold text-[var(--text-primary)]">
              {formatPosition(entry.position)} - {entry.username}
            </p>
          </div>
        </div>
        <dl className="grid grid-cols-3 gap-3 text-center">
          <Stat label="Pontos" value={entry.total_points} />
          <Stat label="Palpites" value={entry.total_predictions} />
          <Stat label="Exatos" value={`${accuracy}%`} />
        </dl>
      </div>
    </aside>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <dt className="text-xs text-green-100/80">{label}</dt>
      <dd className="text-lg font-black text-green-100">{value}</dd>
    </div>
  )
}
