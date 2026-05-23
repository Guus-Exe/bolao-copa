"use server"

import { redirect } from "next/navigation"

import { createServerClient } from "@/lib/supabase/server"
import { authSchema, signUpSchema } from "@/lib/validations"

function encodedMessage(path: string, message: string) {
  return `${path}?message=${encodeURIComponent(message)}`
}

function getSignUpErrorMessage(error: { code?: string; message: string }) {
  // Traduz apenas o limite de envio de email para uma mensagem amigável.
  if (
    error.code === "over_email_send_rate_limit" ||
    error.message.includes("over_email_send_rate_limit")
  ) {
    return "Muitas tentativas de cadastro. Tente novamente mais tarde."
  }

  return error.message
}

export async function signIn(formData: FormData) {
  const parsed = authSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  })

  if (!parsed.success) {
    redirect(encodedMessage("/login", "Informe email e senha válidos."))
  }

  const supabase = createServerClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) {
    redirect(encodedMessage("/login", "Email ou senha inválidos."))
  }

  redirect("/dashboard")
}

export async function signUp(formData: FormData) {
  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    username: formData.get("username")
  })

  if (!parsed.success) {
    redirect(encodedMessage("/signup", "Dados inválidos. Verifique os campos e tente novamente."))
  }

  const supabase = createServerClient()
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        username: parsed.data.username
      }
    }
  })

  if (error) {
    redirect(encodedMessage("/signup", getSignUpErrorMessage(error)))
  }

  redirect(
    encodedMessage(
      "/login",
      "Conta criada! Faça login para continuar."
    )
  )
}

export async function signOut() {
  const supabase = createServerClient()
  await supabase.auth.signOut()
  redirect("/login")
}
