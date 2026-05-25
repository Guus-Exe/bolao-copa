"use server"

import { redirect } from "next/navigation"

import { supabaseAdmin } from "@/lib/supabase/admin"
import { createServerClient } from "@/lib/supabase/server"
import { authSchema, signUpSchema, accountEmailSchema, passwordUpdateSchema } from "@/lib/validations"
import { headers } from "next/headers"

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
    confirmPassword?: string[]
  }
  data?: {
    email?: string
    username?: string
  }
} | null

export async function signIn(_prevState: AuthState, formData: FormData): Promise<AuthState> {
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

  const rememberMe = formData.get("remember") === "on"
  const supabase = createServerClient(rememberMe)
  const { error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) {
    return { 
      message: "Email ou senha inválidos.",
      data: { email: data.email }
    }
  }

  redirect("/dashboard")
}

export async function signUp(_prevState: AuthState, formData: FormData): Promise<AuthState> {
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

export async function forgotPassword(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const data = {
    email: formData.get("email") as string
  }

  const parsed = accountEmailSchema.safeParse(data)

  if (!parsed.success) {
    return {
      message: "Verifique o email informado.",
      errors: parsed.error.flatten().fieldErrors,
      data: { email: data.email }
    }
  }

  const supabase = createServerClient()
  const headersList = await headers()
  const host = headersList.get("host")
  const protocol = headersList.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https")
  
  let origin = "http://localhost:3000"
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    origin = process.env.NEXT_PUBLIC_SITE_URL
  } else if (process.env.VERCEL_URL) {
    origin = `https://${process.env.VERCEL_URL}`
  } else if (host) {
    origin = `${protocol}://${host}`
  }
  
  // Remove trailing slash if exists
  origin = origin.replace(/\/$/, '')
  
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`
  })

  if (error) {
    return {
      message: "Ocorreu um erro ao enviar o email. Tente novamente.",
      data: { email: data.email }
    }
  }

  return {
    message: "Verifique sua caixa de entrada! Um link de redefinição foi enviado para o seu email.",
    data: { email: "" } // limpar form
  }
}

export async function updatePassword(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const data = {
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string
  }

  const parsed = passwordUpdateSchema.safeParse(data)

  if (!parsed.success) {
    return {
      message: "Verifique os campos abaixo e tente novamente.",
      errors: parsed.error.flatten().fieldErrors
    }
  }

  const supabase = createServerClient()
  
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password
  })

  if (error) {
    return {
      message: "Não foi possível atualizar sua senha. O link pode ter expirado."
    }
  }

  redirect(encodedMessage("/login", "Senha alterada com sucesso! Faça login com a nova senha."))
}
