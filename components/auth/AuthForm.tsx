"use client"

import { Trophy, Loader2 } from "lucide-react"
import { useActionState } from "react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { AuthState } from "@/app/actions/auth"

type AuthFormProps = {
  title: string
  description: string
  action: (prevState: AuthState, formData: FormData) => Promise<AuthState>
  buttonLabel: string
  message?: string // Initial message
  footer: ReactNode
  showUsername?: boolean
}

export function AuthForm({
  title,
  description,
  action,
  buttonLabel,
  message,
  footer,
  showUsername
}: AuthFormProps) {
  const [state, formAction, isPending] = useActionState(action, { message })

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--bg-base)] px-4 py-12">
      <Card className="w-full max-w-md border-[var(--border-strong)] bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-[0_0_40px_var(--green-glow)]">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Trophy className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <CardTitle className="font-[family-name:var(--font-display)] text-4xl tracking-wide">
              {title}
            </CardTitle>
            <CardDescription className="mt-2 text-[var(--text-secondary)]">
              {description}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {state?.message ? (
            <p className="mb-4 rounded-md border border-[var(--border-strong)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-secondary)]">
              {state.message}
            </p>
          ) : null}
          <form action={formAction} className="space-y-4" noValidate>
            {showUsername && (
              <div className="space-y-2">
                <Label htmlFor="username">Apelido</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  placeholder="Seu apelido"
                  minLength={3}
                  maxLength={20}
                  className={state?.errors?.username ? "border-red-500 focus-visible:ring-red-500" : ""}
                  defaultValue={state?.data?.username || ""}
                />
                {state?.errors?.username && (
                  <p className="text-sm text-red-500">{state.errors.username[0]}</p>
                )}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="voce@email.com"
                className={state?.errors?.email ? "border-red-500 focus-visible:ring-red-500" : ""}
                defaultValue={state?.data?.email || ""}
              />
              {state?.errors?.email && (
                <p className="text-sm text-red-500">{state.errors.email[0]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                minLength={6}
                placeholder="Minimo 6 caracteres"
                className={state?.errors?.password ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {state?.errors?.password && (
                <p className="text-sm text-red-500">{state.errors.password[0]}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Aguarde...
                </>
              ) : (
                buttonLabel
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center text-sm text-[var(--text-secondary)]">
          {footer}
        </CardFooter>
      </Card>
    </main>
  )
}
