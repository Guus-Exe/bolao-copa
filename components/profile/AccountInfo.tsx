"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { KeyRound, Loader2, Mail, Eye, EyeOff, AlertTriangle, CheckCircle2 } from "lucide-react"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import type { z } from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import { accountEmailSchema, passwordUpdateSchema } from "@/lib/validations"


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

      {modal === "email" ? <EmailModal email={email} onClose={() => setModal(null)} /> : null}
      {modal === "password" ? <PasswordModal onClose={() => setModal(null)} /> : null}
    </section>
  )
}

function EmailModal({ email, onClose }: { email: string; onClose: () => void }) {
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
      setFeedback("Verifique seu novo email para confirmar a alteração.")
    })
  }

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full max-w-md border-[var(--border-strong)] bg-[var(--bg-surface)] p-6 shadow-2xl text-[var(--text-primary)] rounded-lg">
        <DialogHeader className="mb-4">
          <DialogTitle className="font-[family-name:var(--font-display)] text-3xl tracking-wide text-left">
            Alterar email
          </DialogTitle>
          <DialogDescription className="sr-only">
            Formulário para alteração de e-mail de conta
          </DialogDescription>
        </DialogHeader>

        {feedback ? (
          <div className="text-center py-6 space-y-4 animate-fade-slide">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--green-glow)] border border-[var(--green-500)] text-[var(--green-500)] mb-2 relative">
              <Mail className="h-8 w-8 animate-bounce" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--green-500)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-[var(--green-500)]"></span>
              </span>
            </div>
            <h4 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--text-primary)]">
              Verifique seu email!
            </h4>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-sm mx-auto">
              Enviamos instruções de confirmação para o novo email. Acesse a caixa de entrada para confirmar.
            </p>
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-strong)] rounded-lg p-4 text-xs text-[var(--text-secondary)] text-left space-y-2">
              <p className="font-semibold text-[var(--text-primary)]">Instruções importantes:</p>
              <p>Acesse o seu <strong>novo email</strong> e clique no link de confirmação para finalizar a alteração.</p>
              <p className="text-[var(--text-muted)] text-[10px] mt-1">Dica: Verifique também a pasta de Spam se não encontrar o email.</p>
            </div>
            <Button type="button" onClick={onClose} className="w-full mt-4">
              Fechar
            </Button>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="rounded-lg border border-[var(--border-strong)] bg-[var(--bg-elevated)] p-3 text-xs">
              <div className="min-w-0">
                <span className="text-[var(--text-muted)] font-semibold uppercase tracking-wider block mb-0.5">Email Atual</span>
                <span className="text-[var(--text-primary)] break-all font-medium">{email}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-email">Novo email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-secondary)]" />
                <Input
                  id="new-email"
                  type="email"
                  autoComplete="email"
                  placeholder="exemplo@email.com"
                  disabled={isPending}
                  className="pl-10 border-[var(--border-strong)] focus-visible:ring-1 focus-visible:ring-[var(--green-500)] bg-[var(--bg-elevated)]"
                  {...form.register("email")}
                />
              </div>
              {form.formState.errors.email?.message ? (
                <p className="text-xs text-red-400 mt-1">{form.formState.errors.email.message}</p>
              ) : null}
            </div>

            <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-3 text-xs text-yellow-300 flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-yellow-400" />
              <div>
                <span className="font-bold block mb-0.5">Confirmação de E-mail</span>
                Você precisará clicar no link enviado para o seu novo e-mail para confirmar e finalizar a alteração.
              </div>
            </div>

            {error ? (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400 flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-red-500" />
                <span>{error}</span>
              </div>
            ) : null}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending} className="gap-2">
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                Alterar Email
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
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
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full max-w-md border-[var(--border-strong)] bg-[var(--bg-surface)] p-6 shadow-2xl text-[var(--text-primary)] rounded-lg">
        <DialogHeader className="mb-4">
          <DialogTitle className="font-[family-name:var(--font-display)] text-3xl tracking-wide text-left">
            Alterar senha
          </DialogTitle>
          <DialogDescription className="sr-only">
            Formulário para alteração de senha de conta
          </DialogDescription>
        </DialogHeader>

        {feedback ? (
          <div className="text-center py-6 space-y-4 animate-fade-slide">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--green-glow)] border border-[var(--green-500)] text-[var(--green-500)] mb-2">
              <CheckCircle2 className="h-8 w-8 text-[var(--green-500)]" />
            </div>
            <h4 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--text-primary)]">
              Senha alterada!
            </h4>
            <p className="text-sm text-[var(--text-secondary)] max-w-xs mx-auto">
              Sua senha foi atualizada com sucesso. Utilize a nova senha no próximo acesso.
            </p>
            <Button type="button" onClick={onClose} className="w-full mt-4">
              Fechar
            </Button>
          </div>
        ) : (
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

            {error ? (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400 flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-red-500" />
                <span>{error}</span>
              </div>
            ) : null}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending} className="gap-2">
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                Salvar senha
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
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
  const [visible, setVisible] = useState(false)
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete="new-password"
          disabled={disabled}
          className="pr-10"
          {...registration}
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] focus:outline-none transition-colors"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
    </div>
  )
}

