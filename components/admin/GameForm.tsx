"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { X } from "lucide-react"
import { useEffect, useState, type ReactNode } from "react"
import { useForm } from "react-hook-form"
import type { z } from "zod"

import { createGame, updateGame } from "@/app/actions/admin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GAME_STAGES } from "@/lib/constants"
import { adminGameSchema } from "@/lib/validations"
import type { Game } from "@/types"

type GameFormValues = z.infer<typeof adminGameSchema>

type GameFormProps = {
  open: boolean
  game: Game | null
  onClose: () => void
  onSaved: (message: string) => void
}

const STAGE_LABELS: Record<string, string> = {
  grupo: "Grupo",
  oitavas: "Oitavas",
  quartas: "Quartas",
  semi: "Semifinal",
  final: "Final"
}

export function GameForm({ open, game, onClose, onSaved }: GameFormProps) {
  const [error, setError] = useState<string | null>(null)
  const form = useForm<GameFormValues>({
    resolver: zodResolver(adminGameSchema),
    defaultValues: getDefaultValues(game)
  })

  useEffect(() => {
    form.reset(getDefaultValues(game))
    setError(null)
  }, [form, game, open])

  if (!open) {
    return null
  }

  async function onSubmit(values: GameFormValues) {
    setError(null)

    // Force the input to be interpreted as UTC-3 (Brasília)
    const payload = {
      ...values,
      match_date: new Date(values.match_date + "-03:00").toISOString()
    }
    const result = game
      ? await updateGame(game.id, payload)
      : await createGame(payload)

    if (!result.success) {
      setError(result.error)
      return
    }

    onSaved(game ? "Jogo atualizado com sucesso." : "Jogo criado com sucesso.")
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg border border-sky-500/20 bg-slate-950 p-5 text-white shadow-2xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sky-300">
              Gerenciar jogos
            </p>
            <h2 className="mt-1 text-2xl font-bold">
              {game ? "Editar jogo" : "Novo jogo"}
            </h2>
          </div>
          <Button type="button" size="icon" variant="ghost" onClick={onClose}>
            <X size={18} />
            <span className="sr-only">Fechar</span>
          </Button>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-5 space-y-4">
          <div className="grid gap-4 md:grid-cols-[1fr_92px_1fr_92px]">
            <Field label="Time casa" error={form.formState.errors.home_team?.message}>
              <Input {...form.register("home_team")} />
            </Field>
            <Field label="Flag" error={form.formState.errors.home_flag?.message}>
              <Input {...form.register("home_flag")} />
            </Field>
            <Field label="Time fora" error={form.formState.errors.away_team?.message}>
              <Input {...form.register("away_team")} />
            </Field>
            <Field label="Flag" error={form.formState.errors.away_flag?.message}>
              <Input {...form.register("away_flag")} />
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <Field label="Data e hora" error={form.formState.errors.match_date?.message}>
              <Input type="datetime-local" {...form.register("match_date")} />
            </Field>
            <Field label="Fase" error={form.formState.errors.stage?.message}>
              <select
                className="h-10 w-full rounded-md border border-[var(--border-strong)] bg-[var(--bg-elevated)] px-3 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-500"
                {...form.register("stage")}
              >
                {GAME_STAGES.map((stage) => (
                  <option key={stage} value={stage}>
                    {STAGE_LABELS[stage]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Grupo" error={form.formState.errors.group_name?.message}>
              <Input placeholder="A, B, C..." {...form.register("group_name")} />
            </Field>
            <Field label="ID API (Opcional)" error={form.formState.errors.api_fixture_id?.message}>
              <Input type="number" placeholder="Ex: 1045622" {...form.register("api_fixture_id")} />
            </Field>
          </div>

          {error ? <p className="text-sm text-red-300">{error}</p> : null}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="bg-sky-500 text-white hover:bg-sky-600"
            >
              {form.formState.isSubmitting ? "Salvando..." : "Salvar jogo"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({
  label,
  error,
  children
}: {
  label: string
  error?: string
  children: ReactNode
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-xs text-red-300">{error}</p> : null}
    </div>
  )
}

function getDefaultValues(game: Game | null): GameFormValues {
  return {
    home_team: game?.home_team ?? "",
    away_team: game?.away_team ?? "",
    home_flag: game?.home_flag ?? "",
    away_flag: game?.away_flag ?? "",
    match_date: game ? toDatetimeLocal(game.match_date) : "",
    stage: (game?.stage as GameFormValues["stage"]) ?? "grupo",
    group_name: game?.group_name ?? "",
    api_fixture_id: game?.api_fixture_id ?? null
  }
}

function toDatetimeLocal(value: string) {
  const date = new Date(value)
  // Convert absolute UTC time to UTC-3 display time
  const utc3Time = date.getTime() - 3 * 60 * 60 * 1000
  const local = new Date(utc3Time)
  return local.toISOString().slice(0, 16)
}
