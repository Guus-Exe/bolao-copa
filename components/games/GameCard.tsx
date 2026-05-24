"use client"

import { useState, useTransition, type FormEvent } from "react"

import { savePrediction } from "@/app/actions/predictions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Countdown } from "@/components/games/Countdown"
import { calculatePoints } from "@/lib/scoring"
import { cn, formatDate, formatScore } from "@/lib/utils"
import type { Game, Prediction } from "@/types"

type GameCardProps = {
  game: Game
  prediction: Prediction | null
  onSaved: (prediction: Prediction) => void
  onError: (message: string) => void
}

export function GameCard({
  game,
  prediction,
  onSaved,
  onError
}: GameCardProps) {
  const [homeScore, setHomeScore] = useState(
    prediction?.predicted_home_score.toString() ?? ""
  )
  const [awayScore, setAwayScore] = useState(
    prediction?.predicted_away_score.toString() ?? ""
  )
  const [isPending, startTransition] = useTransition()

  const matchDate = new Date(game.match_date)
  const hasResult = game.home_score !== null && game.away_score !== null
  const isFinished = game.is_finished && hasResult
  const deadlineDate = new Date(matchDate.getTime() - 60 * 60 * 1000)
  const nowTime = new Date().getTime()
  const isDeadlineClosed = nowTime >= deadlineDate.getTime()
  const isUrgent = !isDeadlineClosed && (deadlineDate.getTime() - nowTime < 2 * 60 * 60 * 1000)
  const earnedPoints = getPoints(game, prediction)
  const status = getPredictionStatus(prediction, isFinished, earnedPoints)
  const submitLabel = prediction ? "Alterar palpite" : "Salvar palpite"
  const [isShaking, setIsShaking] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (homeScore.trim() === "" || awayScore.trim() === "") {
      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 500)
      onError("Preencha o placar completo para salvar.")
      return
    }

    const parsedHome = Number(homeScore)
    const parsedAway = Number(awayScore)

    if (!Number.isInteger(parsedHome) || !Number.isInteger(parsedAway)) {
      onError("Informe placares inteiros para salvar.")
      return
    }

    startTransition(async () => {
      const result = await savePrediction(game.id, parsedHome, parsedAway)

      if (!result.success) {
        onError(result.error)
        return
      }

      onSaved(result.data)
    })
  }

  return (
    <article
      className={cn(
        "rounded-lg border bg-[var(--bg-surface)] p-5 transition-all duration-300",
        isUrgent
          ? "border-red-500/60 shadow-[0_0_20px_rgba(239,68,68,0.15)]"
          : "border-[var(--border-strong)] hover:border-[var(--border-hover)]"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "rounded-full border px-2.5 py-1 text-xs font-semibold",
            status.className
          )}
        >
          {status.label}
        </span>
        <span className="text-right text-xs font-medium uppercase tracking-[0.14em] text-[var(--text-muted)]">
          {game.group_name ? `Grupo ${game.group_name}` : "Mata-mata"}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <TeamBlock flag={game.home_flag} name={game.home_team} />
        <span className="text-sm font-semibold text-[var(--text-secondary)]">
          vs
        </span>
        <TeamBlock flag={game.away_flag} name={game.away_team} align="right" />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-[var(--text-secondary)]">
          {formatDate(game.match_date)} (Brasília)
        </p>
        {!hasResult && <Countdown deadline={deadlineDate} />}
      </div>

      {hasResult ? (
        <div className="mt-5 grid gap-3 rounded-lg bg-[var(--bg-elevated)] p-4 text-sm">
          <ResultRow label="Resultado" value={formatScore(game.home_score, game.away_score)} />
          <ResultRow
            label="Seu palpite"
            value={
              prediction
                ? formatScore(
                  prediction.predicted_home_score,
                  prediction.predicted_away_score
                )
                : "-"
            }
          />
          <ResultRow label="Pontos" value={`${earnedPoints} pts`} />
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="mt-5 rounded-lg bg-green-950/30 p-4"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
          Seu palpite
        </p>

        <div className={cn("mt-5 flex items-center justify-center gap-6", isShaking && "animate-shake")}>
          <PredictionField
            team={game.home_team}
            value={homeScore}
            disabled={isDeadlineClosed || isPending}
            onChange={setHomeScore}
          />
          <span className="text-xl font-black text-[var(--green-500)]">
            ×
          </span>
          <PredictionField
            team={game.away_team}
            value={awayScore}
            disabled={isDeadlineClosed || isPending}
            onChange={setAwayScore}
          />
        </div>

        <div className="mt-3">
          {isDeadlineClosed ? (
            <span className="flex h-9 w-full items-center justify-center rounded-md border border-yellow-500/30 bg-yellow-500/10 px-3 text-sm font-semibold text-yellow-200">
              {isFinished ? "Jogo finalizado" : "Em andamento"}
            </span>
          ) : (
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="h-10 w-full bg-[var(--green-500)] border border-[var(--green-500)] text-black text-sm font-bold shadow-[0_0_10px_var(--green-glow)] hover:bg-black hover:text-[var(--green-500)] hover:shadow-[0_0_20px_var(--green-glow)] transition-all duration-300"
            >
              {isPending ? "Salvando..." : submitLabel}
            </Button>
          )}
        </div>
      </form>
    </article>
  )
}

function PredictionField({
  team,
  value,
  disabled,
  onChange
}: {
  team: string
  value: string
  disabled: boolean
  onChange: (value: string) => void
}) {
  return (
    <label className="block">
      <Input
        aria-label={`Palpite para ${team}`}
        className="prediction-score-input h-16 w-16 appearance-none text-center text-3xl font-black transition-all focus:border-[var(--green-500)] focus:shadow-[0_0_15px_var(--green-glow)] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        disabled={disabled}
        inputMode="numeric"
        max={20}
        min={0}
        type="number"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

function TeamBlock({
  flag,
  name,
  align = "left"
}: {
  flag: string
  name: string
  align?: "left" | "right"
}) {
  return (
    <div
      className={cn(
        "min-w-0",
        align === "right" ? "text-right" : "text-left"
      )}
    >
      <div className="text-3xl leading-none">{flag}</div>
      <p className="mt-2 truncate font-semibold">{name}</p>
    </div>
  )
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[var(--text-secondary)]">{label}</span>
      <span className="font-semibold text-[var(--text-primary)]">{value}</span>
    </div>
  )
}

function getPoints(game: Game, prediction: Prediction | null) {
  if (
    prediction?.points_earned !== null &&
    prediction?.points_earned !== undefined
  ) {
    return prediction.points_earned
  }

  if (
    !prediction ||
    game.home_score === null ||
    game.away_score === null ||
    !game.is_finished
  ) {
    return 0
  }

  return calculatePoints(
    {
      homeScore: prediction.predicted_home_score,
      awayScore: prediction.predicted_away_score
    },
    { homeScore: game.home_score, awayScore: game.away_score }
  )
}

function getPredictionStatus(
  prediction: Prediction | null,
  isFinished: boolean,
  points: number
) {
  if (!prediction) {
    return {
      label: "Não palpitou",
      className: "border-yellow-500/30 bg-yellow-500/10 text-yellow-300"
    }
  }

  if (!isFinished) {
    return {
      label: "Palpitado",
      className: "border-green-500/30 bg-green-500/10 text-green-300"
    }
  }

  if (points > 0) {
    return {
      label: "Acertou",
      className: "border-green-500/30 bg-green-500/10 text-green-300"
    }
  }

  return {
    label: "Errou",
    className: "border-red-500/30 bg-red-500/10 text-red-300"
  }
}
