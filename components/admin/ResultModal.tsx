"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { X } from "lucide-react"
import { useEffect, useState, type ReactNode } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { clearResult, insertResult } from "@/app/actions/admin-results"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { adminResultSchema } from "@/lib/validations"
import type { Game } from "@/types"

type ResultFormValues = z.infer<typeof adminResultSchema>

type ResultModalProps = {
  game: Game | null
  onClose: () => void
  onSaved: (message: string) => void
}

export function ResultModal({ game, onClose, onSaved }: ResultModalProps) {
  const [error, setError] = useState<string | null>(null)
  const form = useForm<ResultFormValues>({
    resolver: zodResolver(adminResultSchema),
    defaultValues: getDefaultValues(game)
  })

  useEffect(() => {
    form.reset(getDefaultValues(game))
    setError(null)
  }, [form, game])

  if (!game) {
    return null
  }

  async function onSubmit(values: ResultFormValues) {
    setError(null)
    const result = await insertResult(
      values.gameId,
      values.homeScore,
      values.awayScore,
      values.isFinished
    )

    if (!result.success) {
      setError(result.error)
      return
    }

    onSaved(`${result.data.updated} palpites atualizados.`)
    onClose()
  }

  async function handleClearResult() {
    if (!game) {
      return
    }

    setError(null)
    const result = await clearResult(game.id)

    if (!result.success) {
      setError(result.error)
      return
    }

    onSaved("Resultado limpo. O jogo voltou a ficar aberto.")
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-lg border border-sky-500/20 bg-slate-950 p-5 text-white shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sky-300">
              Inserir resultado
            </p>
            <h2 className="mt-1 text-xl font-bold">
              {game.home_flag} {game.home_team} x {game.away_team} {game.away_flag}
            </h2>
          </div>
          <Button type="button" size="icon" variant="ghost" onClick={onClose}>
            <X size={18} />
            <span className="sr-only">Fechar</span>
          </Button>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-5 space-y-4">
          <input type="hidden" {...form.register("gameId")} />
          <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
            <Field label="Casa" error={form.formState.errors.homeScore?.message}>
              <Input
                type="number"
                min={0}
                max={20}
                {...form.register("homeScore", { valueAsNumber: true })}
              />
            </Field>
            <span className="pb-2 text-sky-200">x</span>
            <Field label="Fora" error={form.formState.errors.awayScore?.message}>
              <Input
                type="number"
                min={0}
                max={20}
                {...form.register("awayScore", { valueAsNumber: true })}
              />
            </Field>
          </div>

          <label className="flex items-center gap-3 rounded-md border border-sky-500/20 bg-sky-500/10 p-3 text-sm font-semibold text-sky-100">
            <input
              type="checkbox"
              className="h-4 w-4 accent-sky-500"
              {...form.register("isFinished")}
            />
            Jogo finalizado
          </label>

          {error ? <p className="text-sm text-red-300">{error}</p> : null}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleClearResult}
              className="border-yellow-500/30 text-yellow-200 hover:bg-yellow-500/10"
              disabled={form.formState.isSubmitting}
            >
              Limpar resultado
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="bg-sky-500 text-white hover:bg-sky-600"
            >
              {form.formState.isSubmitting ? "Salvando..." : "Salvar resultado"}
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

function getDefaultValues(game: Game | null): ResultFormValues {
  return {
    gameId: game?.id ?? "00000000-0000-0000-0000-000000000000",
    homeScore: game?.home_score ?? 0,
    awayScore: game?.away_score ?? 0,
    isFinished: true
  }
}
