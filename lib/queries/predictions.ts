import "server-only"

import { createServerClient } from "@/lib/supabase/server"
import type { Prediction } from "@/types"
import { z } from "zod"

export type ActionResult<T = void> =
  | { success: true; data: T; error?: never }
  | { success: false; error: string; data?: never }

const userIdSchema = z.string().uuid()

export async function getUserPredictions(
  userId: string
): Promise<ActionResult<Prediction[]>> {
  const parsed = userIdSchema.safeParse(userId)

  if (!parsed.success) {
    return { success: false, error: "Usuário inválido." }
  }

  const supabase = createServerClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Você precisa estar logado." }
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single()
  const profile = profileData as { is_admin: boolean } | null

  if (user.id !== parsed.data && !profile?.is_admin) {
    return { success: false, error: "Você não pode acessar estes palpites." }
  }

  const { data, error } = await supabase
    .from("predictions")
    .select("*")
    .eq("user_id", parsed.data)

  if (error) {
    return { success: false, error: "Não foi possível buscar os palpites." }
  }

  return { success: true, data: (data ?? []) as Prediction[] }
}
