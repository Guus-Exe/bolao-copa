"use server"

import { redirect } from "next/navigation"

import { createServerClient } from "@/lib/supabase/server"
import { authSchema } from "@/lib/validations"

function encodedMessage(path: string, message: string) {
  return `${path}?message=${encodeURIComponent(message)}`
}

function getSignUpErrorMessage(error: { code?: string; message: string }) {
  // Traduz apenas o limite de envio de email para uma mensagem amigavel.
  if (
    error.code === "over_email_send_rate_limit" ||
    error.message.includes("over_email_send_rate_limit")
  ) {
    return "Muitas tentativas de cadastro. Aguarde alguns minutos e tente novamente."
  }

  return error.message
}

export async function signIn(formData: FormData) {
  const parsed = authSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  })

  if (!parsed.success) {
    redirect(encodedMessage("/login", "Informe email e senha validos."))
  }

  const supabase = createServerClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) {
    redirect(encodedMessage("/login", "Email ou senha invalidos."))
  }

  redirect("/dashboard")
}

export async function signUp(formData: FormData) {
  const parsed = authSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  })

  if (!parsed.success) {
    redirect(encodedMessage("/signup", "Informe email e senha validos."))
  }

  const supabase = createServerClient()
  const { error } = await supabase.auth.signUp(parsed.data)

  if (error) {
    redirect(encodedMessage("/signup", getSignUpErrorMessage(error)))
  }

  redirect(
    encodedMessage(
      "/login",
      "Sua conta ja foi criada. Faca login para continuar."
    )
  )
}

export async function signOut() {
  const supabase = createServerClient()
  await supabase.auth.signOut()
  redirect("/login")
}
