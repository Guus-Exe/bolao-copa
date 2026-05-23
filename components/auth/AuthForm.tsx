import { Trophy } from "lucide-react"
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

type AuthFormProps = {
  title: string
  description: string
  action: (formData: FormData) => Promise<void>
  buttonLabel: string
  message?: string
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
          {message ? (
            <p className="mb-4 rounded-md border border-[var(--border-strong)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-secondary)]">
              {message}
            </p>
          ) : null}
          <form action={action} className="space-y-4">
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
                />
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                minLength={8}
                placeholder="Minimo 8 caracteres"
              />
            </div>
            <Button type="submit" className="w-full">
              {buttonLabel}
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
