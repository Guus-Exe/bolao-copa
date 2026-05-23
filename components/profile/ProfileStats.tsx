import { CircleCheck, Goal, Target, Trophy } from "lucide-react"

import { cn } from "@/lib/utils"
import type { RankingEntry } from "@/types"

type ProfileStatsProps = {
  entry: RankingEntry | null
}

export function ProfileStats({ entry }: ProfileStatsProps) {
  const stats = [
    {
      label: "Pontos acumulados",
      value: entry?.total_points ?? 0,
      icon: Trophy
    },
    {
      label: "Posicao no ranking",
      value: entry ? `${entry.position}°` : "-",
      icon: Goal
    },
    {
      label: "Palpites feitos",
      value: entry?.total_predictions ?? 0,
      icon: CircleCheck
    },
    {
      label: "Placares exatos",
      value: entry?.exact_scores ?? 0,
      icon: Target
    }
  ]

  return (
    <section className="rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] p-5">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-wide">
          Estatísticas pessoais
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">
          Resumo somente leitura da sua campanha no bolão.
        </p>
      </div>

      <dl className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-[var(--border-strong)] bg-[var(--bg-elevated)] p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <dt className="text-sm text-[var(--text-secondary)]">{stat.label}</dt>
              <stat.icon className="h-4 w-4 text-yellow-300" />
            </div>
            <dd
              className={cn(
                "mt-3 font-[family-name:var(--font-display)] text-4xl tracking-wide",
                "text-[var(--text-primary)]"
              )}
            >
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
