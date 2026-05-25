"use client"

import { Trophy, Loader2, Eye, EyeOff, Mail } from "lucide-react"
import { useActionState, useEffect, useState } from "react"
import type { ReactNode } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
  showRememberMe?: boolean
  forgotPasswordLink?: string
  showPassword?: boolean
  showConfirmPassword?: boolean
  showEmail?: boolean
}

export function AuthForm({
  title,
  description,
  action,
  buttonLabel,
  message,
  footer,
  showUsername,
  showRememberMe,
  forgotPasswordLink,
  showPassword = true,
  showConfirmPassword,
  showEmail = true
}: AuthFormProps) {
  const [state, formAction, isPending] = useActionState(action, { message })
  const [email, setEmail] = useState(state?.data?.email || "")
  const [showPasswordVisible, setShowPasswordVisible] = useState(false)
  const [showConfirmPasswordVisible, setShowConfirmPasswordVisible] = useState(false)
  const [rememberMeChecked, setRememberMeChecked] = useState(true)

  useEffect(() => {
    if (showRememberMe && !state?.data?.email) {
      const stored = localStorage.getItem("bolao_user_email")
      if (stored) setEmail(stored)
    }
  }, [state?.data?.email, showRememberMe])

  const handleSubmit = () => {
    if (showRememberMe) {
      if (rememberMeChecked) {
        localStorage.setItem("bolao_user_email", email)
      } else {
        localStorage.removeItem("bolao_user_email")
      }
    }
  }

  const isForgotPasswordSuccess = 
    title === "Esqueceu a senha?" && 
    state?.message && 
    (state.message.includes("caixa de entrada") || state.message.includes("redefinição"))

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--bg-base)] px-4 py-12">
      <Card className="w-full max-w-md border-[var(--border-strong)] bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-[0_0_40px_var(--green-glow)]">
        {!isForgotPasswordSuccess && (
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
        )}
        <CardContent>
          {isForgotPasswordSuccess ? (
            <div className="text-center py-4 space-y-4 animate-fade-slide">
              <div className="mx-auto inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--green-glow)] border border-[var(--green-500)] text-[var(--green-500)] mb-2 relative">
                <Mail className="h-8 w-8 animate-bounce" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--green-500)] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-[var(--green-500)]"></span>
                </span>
              </div>
              <h4 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--text-primary)]">
                Email Enviado!
              </h4>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Enviamos um link de redefinição de senha para o seu email. Acesse a caixa de entrada para redefinir.
              </p>
              <div className="bg-[var(--bg-elevated)] border border-[var(--border-strong)] rounded-lg p-4 text-xs text-[var(--text-secondary)] text-left space-y-2">
                <p className="font-semibold text-[var(--text-primary)]">Instruções importantes:</p>
                <p>1. Acesse o seu email e clique no link de redefinição de senha.</p>
                <p>2. Se não encontrar o email em alguns minutos, verifique a pasta de <strong>Spam</strong> ou <strong>Lixo Eletrônico</strong>.</p>
              </div>
            </div>
          ) : (
            <>
              {state?.message ? (
                <p className="mb-4 rounded-md border border-[var(--border-strong)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-secondary)]">
                  {state.message}
                </p>
              ) : null}
              <form action={formAction} onSubmit={handleSubmit} className="space-y-4" noValidate>
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
                {showEmail && (
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    {state?.errors?.email && (
                      <p className="text-sm text-red-500">{state.errors.email[0]}</p>
                    )}
                  </div>
                )}
                {showPassword && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Senha</Label>
                      {forgotPasswordLink && (
                        <Link
                          href={forgotPasswordLink}
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          Esqueceu a senha?
                        </Link>
                      )}
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPasswordVisible ? "text" : "password"}
                        autoComplete="current-password"
                        required
                        minLength={6}
                        placeholder="Minimo 6 caracteres"
                        className={`pr-10 ${
                          state?.errors?.password ? "border-red-500 focus-visible:ring-red-500" : ""
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswordVisible(!showPasswordVisible)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] focus:outline-none transition-colors"
                      >
                        {showPasswordVisible ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {state?.errors?.password && (
                      <p className="text-sm text-red-500">{state.errors.password[0]}</p>
                    )}
                  </div>
                )}
                {showConfirmPassword && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPasswordVisible ? "text" : "password"}
                        autoComplete="new-password"
                        required
                        minLength={6}
                        placeholder="Repita a nova senha"
                        className={`pr-10 ${
                          state?.errors?.confirmPassword ? "border-red-500 focus-visible:ring-red-500" : ""
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPasswordVisible(!showConfirmPasswordVisible)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] focus:outline-none transition-colors"
                      >
                        {showConfirmPasswordVisible ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {state?.errors?.confirmPassword && (
                      <p className="text-sm text-red-500">{state.errors.confirmPassword[0]}</p>
                    )}
                  </div>
                )}
                {showRememberMe && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      name="remember"
                      checked={rememberMeChecked}
                      onCheckedChange={(checked) => setRememberMeChecked(!!checked)}
                    />
                    <Label
                      htmlFor="remember"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Lembrar de mim
                    </Label>
                  </div>
                )}
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
            </>
          )}
        </CardContent>
        <CardFooter className="justify-center text-sm text-[var(--text-secondary)]">
          {footer}
        </CardFooter>
      </Card>
    </main>
  )
}
