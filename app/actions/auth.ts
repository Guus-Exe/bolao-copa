"use server"

import { redirect } from "next/navigation"

import { supabaseAdmin } from "@/lib/supabase/admin"
import { createServerClient } from "@/lib/supabase/server"
import { authSchema, signUpSchema } from "@/lib/validations"

function encodedMessage(path: string, message: string) {
  return `${path}?message=${encodeURIComponent(message)}`
}

function getSignUpErrorMessage(error: { code?: string; message: string }) {
  if (
    error.code === "over_email_send_rate_limit" ||
    error.message.includes("over_email_send_rate_limit")
  ) {
    return "Muitas tentativas de cadastro. Tente novamente mais tarde."
  }
  return error.message
}

export type AuthState = {
  message?: string
  errors?: {
    email?: string[]
    password?: string[]
    username?: string[]
  }
  data?: {
    email?: string
    username?: string
  }
} | null

export async function signIn(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string
  }

  const parsed = authSchema.safeParse(data)

  if (!parsed.success) {
    return {
      message: "Verifique os campos abaixo e tente novamente.",
      errors: parsed.error.flatten().fieldErrors,
      data: { email: data.email }
    }
  }

  const supabase = createServerClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) {
    return { 
      message: "Email ou senha inválidos.",
      data: { email: data.email }
    }
  }

  redirect("/dashboard")
}

export async function signUp(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    username: formData.get("username") as string
  }

  const parsed = signUpSchema.safeParse(data)

  if (!parsed.success) {
    return {
      message: "Verifique os campos abaixo e tente novamente.",
      errors: parsed.error.flatten().fieldErrors,
      data: { email: data.email, username: data.username }
    }
  }

  const { data: existingProfile, error: availabilityError } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("username", parsed.data.username)
    .maybeSingle()

  if (availabilityError) {
    return { 
      message: "Não foi possível verificar o apelido.",
      data: { email: data.email, username: data.username }
    }
  }

  if (existingProfile) {
    return {
      message: "Erro no cadastro.",
      errors: {
        username: ["Este apelido já está em uso. Escolha outro."]
      },
      data: { email: data.email, username: data.username }
    }
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
    if (error.code === "user_already_exists") {
      return {
        message: "Erro no cadastro.",
        errors: {
          email: ["Este email já está cadastrado."]
        },
        data: { email: data.email, username: data.username }
      }
    }
    return { 
      message: getSignUpErrorMessage(error),
      data: { email: data.email, username: data.username }
    }
  }

  redirect(encodedMessage("/login", "Conta criada! Faça login para continuar."))
}

export async function signOut() {
  const supabase = createServerClient()
  await supabase.auth.signOut()
  redirect("/login")
}
