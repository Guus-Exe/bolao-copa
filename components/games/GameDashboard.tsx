"use client"

import { useMemo, useState } from "react"

import { GameCard } from "@/components/games/GameCard"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Game, Prediction } from "@/types"

type StatusFilter = "todos" | "abertos" | "andamento" | "concluidos"
type PredictionFilter = "todos" | "palpitados" | "nao-palpitados"

type GameDashboardProps = {
  games: Game[]
  predictions: Prediction[]
}

const STAGE_LABELS: Record<string, string> = {
  grupo: "Grupos",
  oitavas: "Oitavas",
  quartas: "Quartas",
  semi: "Semifinal",
  final: "Final"
}

const STAGE_ORDER = ["grupo", "oitavas", "quartas", "semi", "final"]

export function GameDashboard({ games, predictions }: GameDashboardProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos")
  const [predictionFilter, setPredictionFilter] =
    useState<PredictionFilter>("todos")
  const [savedPredictions, setSavedPredictions] = useState(predictions)
  const [toast, setToast] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)

  const predictionByGameId = useMemo(() => {
    return new Map(
      savedPredictions.map((prediction) => [prediction.game_id, prediction])
    )
  }, [savedPredictions])

  const filteredGames = useMemo(() => {
    const now = new Date().getTime()

    return games
      .filter((game) => {
        const hasPrediction = predictionByGameId.has(game.id)
        const isClosed = now >= new Date(game.match_date).getTime() - 60 * 60 * 1000
        const isFinished = game.is_finished && game.home_score !== null && game.away_score !== null
        const matchesStatus =
          statusFilter === "todos" ||
          (statusFilter === "abertos" && !isClosed && !isFinished) ||
          (statusFilter === "andamento" && isClosed && !isFinished) ||
          (statusFilter === "concluidos" && isFinished)
        const matchesPrediction =
          predictionFilter === "todos" ||
          (predictionFilter === "palpitados" && hasPrediction) ||
          (predictionFilter === "nao-palpitados" && !hasPrediction)

        return matchesStatus && matchesPrediction
      })
      .sort((a, b) => {
        const timeA = new Date(a.match_date).getTime()
        const timeB = new Date(b.match_date).getTime()

        const isClosedA = now >= timeA - 60 * 60 * 1000
        const isClosedB = now >= timeB - 60 * 60 * 1000

        const isFinishedA = a.is_finished && a.home_score !== null && a.away_score !== null
        const isFinishedB = b.is_finished && b.home_score !== null && b.away_score !== null

        if (isFinishedA && !isFinishedB) return 1
        if (!isFinishedA && isFinishedB) return -1

        if (isClosedA && !isClosedB) return 1
        if (!isClosedA && isClosedB) return -1

        if (!isClosedA && !isClosedB) {
          return timeA - timeB
        }

        return timeB - timeA
      })
  }, [games, predictionByGameId, predictionFilter, statusFilter])

  const gamesByStage = useMemo(() => {
    return STAGE_ORDER.map((stage) => ({
      stage,
      games: filteredGames.filter((game) => game.stage === stage)
    })).filter((group) => group.games.length > 0)
  }, [filteredGames])

  function handleSaved(prediction: Prediction) {
    setSavedPredictions((current) => {
      const next = current.filter((item) => item.game_id !== prediction.game_id)
      return [...next, prediction]
    })
    showToast("success", "Palpite salvo com sucesso.")
  }

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message })
    window.setTimeout(() => setToast(null), 3200)
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-[var(--text-secondary)]">
            {savedPredictions.length} de {games.length} jogos palpitados
          </p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--bg-elevated)] md:w-64">
            <div
              className="h-full rounded-full bg-[var(--green-500)]"
              style={{
                width: games.length
                  ? `${(savedPredictions.length / games.length) * 100}%`
                  : "0%"
              }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 md:items-end">
          <FilterGroup
            options={[
              ["todos", "Todos"],
              ["abertos", "Abertos"],
              ["andamento", "Em andamento"],
              ["concluidos", "Concluídos"]
            ]}
            value={statusFilter}
            onChange={(value) => setStatusFilter(value as StatusFilter)}
          />
          <FilterGroup
            options={[
              ["todos", "Todos os jogos"],
              ["palpitados", "Palpitados"],
              ["nao-palpitados", "Não palpitados"]
            ]}
            value={predictionFilter}
            onChange={(value) => setPredictionFilter(value as PredictionFilter)}
          />
        </div>
      </div>

      {gamesByStage.length > 0 ? (
        gamesByStage.map((group) => (
          <section key={group.stage} className="space-y-3">
            <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-wide">
              {STAGE_LABELS[group.stage] ?? group.stage}
            </h2>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {group.games.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  prediction={predictionByGameId.get(game.id) ?? null}
                  onSaved={handleSaved}
                  onError={(message) => showToast("error", message)}
                />
              ))}
            </div>
          </section>
        ))
      ) : (
        <div className="rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] p-8 text-center text-[var(--text-secondary)]">
          Nenhum jogo encontrado para os filtros selecionados.
        </div>
      )}

      {toast ? (
        <div
          className={cn(
            "fixed bottom-5 right-5 z-50 rounded-lg border px-4 py-3 text-sm font-semibold shadow-lg",
            toast.type === "success"
              ? "border-green-500/30 bg-green-500/15 text-green-200"
              : "border-red-500/30 bg-red-500/15 text-red-200"
          )}
        >
          {toast.message}
        </div>
      ) : null}
    </section>
  )
}

function FilterGroup({
  options,
  value,
  onChange
}: {
  options: [string, string][]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(([optionValue, label]) => (
        <Button
          key={optionValue}
          type="button"
          variant={value === optionValue ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(optionValue)}
        >
          {label}
        </Button>
      ))}
    </div>
  )
}
