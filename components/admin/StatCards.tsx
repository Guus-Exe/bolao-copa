import { CalendarDays, Clock3, ShieldCheck, UsersRound } from "lucide-react"

import type { AdminSummary } from "@/app/actions/admin"

type StatCardsProps = {
  summary: AdminSummary
}

const cardBase =
  "rounded-lg border border-sky-500/20 bg-slate-950/55 p-5 shadow-[0_0_24px_rgba(14,165,233,0.08)]"

export function StatCards({ summary }: StatCardsProps) {
  const stats = [
    {
      label: "Total de usuarios",
      value: summary.totalUsers,
      icon: UsersRound
    },
    {
      label: "Com acesso",
      value: summary.paidUsers,
      icon: ShieldCheck
    },
    {
      label: "Pendentes",
      value: summary.pendingUsers,
      icon: Clock3
    },
    {
      label: "Jogos cadastrados",
      value: summary.totalGames,
      icon: CalendarDays
    }
  ]

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon

        return (
          <article key={stat.label} className={cardBase}>
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-semibold text-sky-200">{stat.label}</p>
              <span className="rounded-md border border-sky-500/20 bg-sky-500/10 p-2 text-sky-300">
                <Icon size={18} aria-hidden="true" />
              </span>
            </div>
            <p className="mt-4 text-3xl font-bold text-white">{stat.value}</p>
          </article>
        )
      })}
    </section>
  )
}
