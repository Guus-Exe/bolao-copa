"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Save } from "lucide-react"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import type { z } from "zod"

import { updateUsername } from "@/app/actions/profile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { usernameSchema } from "@/lib/validations"

type UsernameValues = z.infer<typeof usernameSchema>

export function UsernameForm({ username }: { username: string }) {
  const [feedback, setFeedback] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const form = useForm<UsernameValues>({
    resolver: zodResolver(usernameSchema),
    defaultValues: { username }
  })

  function onSubmit(values: UsernameValues) {
    setFeedback(null)
    setServerError(null)

    startTransition(async () => {
      const result = await updateUsername(values.username)

      if (!result.success) {
        setServerError(result.error)
        return
      }

      form.reset({ username: result.data.username })
      setFeedback("Apelido atualizado com sucesso.")
    })
  }

  const fieldError = form.formState.errors.username?.message

  return (
    <section className="rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] p-5">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-wide">
          Apelido
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">
          O apelido aparece no ranking, chat e cabecalho.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-5 space-y-3">
        <div className="space-y-2">
          <Label htmlFor="username">Apelido</Label>
          <Input
            id="username"
            autoComplete="nickname"
            disabled={isPending}
            {...form.register("username")}
          />
          <p className="text-xs text-[var(--text-muted)]">
            3 a 20 caracteres. Use letras, numeros e underscore.
          </p>
        </div>

        {fieldError || serverError ? (
          <p className="text-sm text-red-300">{fieldError ?? serverError}</p>
        ) : null}

        {feedback ? <p className="text-sm text-green-200">{feedback}</p> : null}

        <Button type="submit" disabled={isPending || !form.formState.isDirty} className="gap-2">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isPending ? "Salvando..." : "Salvar apelido"}
        </Button>
      </form>
    </section>
  )
}
