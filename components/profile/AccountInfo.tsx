"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { KeyRound, Loader2, Mail } from "lucide-react"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import type { z } from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { accountEmailSchema, passwordUpdateSchema } from "@/lib/validations"
import { cn } from "@/lib/utils"

type EmailValues = z.infer<typeof accountEmailSchema>
type PasswordValues = z.infer<typeof passwordUpdateSchema>
type ModalKind = "email" | "password" | null

export function AccountInfo({ email }: { email: string }) {
  const [modal, setModal] = useState<ModalKind>(null)

  return (
    <section className="rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] p-5">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-wide">
          Informações de conta
        </h2>
      </div>

      <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Email atual
          </p>
          <p className="mt-1 break-all text-lg font-semibold">{email}</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button type="button" variant="outline" onClick={() => setModal("email")} className="gap-2">
            <Mail className="h-4 w-4" />
            Alterar email
          </Button>
          <Button type="button" variant="outline" onClick={() => setModal("password")} className="gap-2">
            <KeyRound className="h-4 w-4" />
            Alterar senha
          </Button>
        </div>
      </div>

      {modal === "email" ? <EmailModal onClose={() => setModal(null)} /> : null}
      {modal === "password" ? <PasswordModal onClose={() => setModal(null)} /> : null}
    </section>
  )
}

function EmailModal({ onClose }: { onClose: () => void }) {
  const [feedback, setFeedback] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const form = useForm<EmailValues>({
    resolver: zodResolver(accountEmailSchema),
    defaultValues: { email: "" }
  })

  function onSubmit(values: EmailValues) {
    setFeedback(null)
    setError(null)

    startTransition(async () => {
      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({
        email: values.email
      })

      if (updateError) {
        setError("Não foi possível iniciar a alteração de email.")
        return
      }

      form.reset()
      setFeedback("Verifique seu novo email para confirmar a alteracao.")
    })
  }

  return (
    <Modal title="Alterar email" onClose={onClose}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="new-email">Novo email</Label>
          <Input
            id="new-email"
            type="email"
            autoComplete="email"
            disabled={isPending}
            {...form.register("email")}
          />
          {form.formState.errors.email?.message ? (
            <p className="text-sm text-red-300">{form.formState.errors.email.message}</p>
          ) : null}
        </div>

        <ModalFeedback feedback={feedback} error={error} />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Fechar
          </Button>
          <Button type="submit" disabled={isPending} className="gap-2">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
            Enviar confirmacao
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function PasswordModal({ onClose }: { onClose: () => void }) {
  const [feedback, setFeedback] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const form = useForm<PasswordValues>({
    resolver: zodResolver(passwordUpdateSchema),
    defaultValues: { password: "", confirmPassword: "" }
  })

  function onSubmit(values: PasswordValues) {
    setFeedback(null)
    setError(null)

    startTransition(async () => {
      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({
        password: values.password
      })

      if (updateError) {
        setError("Não foi possível alterar a senha.")
        return
      }

      form.reset()
      setFeedback("Senha alterada com sucesso.")
    })
  }

  return (
    <Modal title="Alterar senha" onClose={onClose}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <PasswordField
          id="new-password"
          label="Nova senha"
          disabled={isPending}
          error={form.formState.errors.password?.message}
          registration={form.register("password")}
        />
        <PasswordField
          id="confirm-password"
          label="Confirmar senha"
          disabled={isPending}
          error={form.formState.errors.confirmPassword?.message}
          registration={form.register("confirmPassword")}
        />

        <ModalFeedback feedback={feedback} error={error} />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Fechar
          </Button>
          <Button type="submit" disabled={isPending} className="gap-2">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
            Salvar senha
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function PasswordField({
  id,
  label,
  disabled,
  error,
  registration
}: {
  id: string
  label: string
  disabled: boolean
  error?: string
  registration: ReturnType<ReturnType<typeof useForm<PasswordValues>>["register"]>
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type="password" autoComplete="new-password" disabled={disabled} {...registration} />
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
    </div>
  )
}

function Modal({
  title,
  children,
  onClose
}: {
  title: string
  children: React.ReactNode
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
      <div className="w-full max-w-md rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h3 className="font-[family-name:var(--font-display)] text-3xl tracking-wide">
            {title}
          </h3>
        </div>
        {children}
      </div>
    </div>
  )
}

function ModalFeedback({
  feedback,
  error
}: {
  feedback: string | null
  error: string | null
}) {
  if (!feedback && !error) {
    return null
  }

  return (
    <p className={cn("text-sm", error ? "text-red-300" : "text-green-200")}>
      {error ?? feedback}
    </p>
  )
}
