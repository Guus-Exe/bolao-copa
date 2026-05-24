import "server-only"

import { supabaseAdmin } from "@/lib/supabase/admin"
import { createServerClient } from "@/lib/supabase/server"
import type { Game, Prediction, Profile } from "@/types"

export type ActionResult<T = void> =
  | { success: true; data: T; error?: never }
  | { success: false; error: string; data?: never }

export type AdminSummary = {
  totalUsers: number
  paidUsers: number
  pendingUsers: number
  totalGames: number
}

export type AdminUser = Profile & {
  email: string
}

export type AdminPrediction = Prediction & {
  game: Pick<
    Game,
    | "home_team"
    | "away_team"
    | "home_flag"
    | "away_flag"
    | "home_score"
    | "away_score"
    | "is_finished"
    | "match_date"
  > | null
}

export async function requireAdmin(): Promise<ActionResult<{ userId: string }>> {
  const supabase = createServerClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Você precisa estar logado." }
  }

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single()

  if (error || !data?.is_admin) {
    return { success: false, error: "Acesso restrito a administradores." }
  }

  return { success: true, data: { userId: user.id } }
}

export async function getAdminSummary(): Promise<ActionResult<AdminSummary>> {
  const admin = await requireAdmin()

  if (!admin.success) {
    return admin
  }

  const [totalUsers, paidUsers, pendingUsers, totalGames] = await Promise.all([
    supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }),
    supabaseAdmin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("is_paid", true),
    supabaseAdmin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("is_paid", false),
    supabaseAdmin.from("games").select("id", { count: "exact", head: true })
  ])

  if (
    totalUsers.error ||
    paidUsers.error ||
    pendingUsers.error ||
    totalGames.error
  ) {
    return { success: false, error: "Não foi possível carregar o resumo." }
  }

  return {
    success: true,
    data: {
      totalUsers: totalUsers.count ?? 0,
      paidUsers: paidUsers.count ?? 0,
      pendingUsers: pendingUsers.count ?? 0,
      totalGames: totalGames.count ?? 0
    }
  }
}

export async function getAdminGames(): Promise<ActionResult<Game[]>> {
  const admin = await requireAdmin()

  if (!admin.success) {
    return admin
  }

  const { data, error } = await supabaseAdmin
    .from("games")
    .select("*")
    .order("match_date", { ascending: true })

  if (error) {
    return { success: false, error: "Não foi possível carregar os jogos." }
  }

  return { success: true, data: (data ?? []) as Game[] }
}

export async function getAdminUsers(): Promise<ActionResult<AdminUser[]>> {
  const admin = await requireAdmin()

  if (!admin.success) {
    return admin
  }

  const { data: profiles, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    return { success: false, error: "Não foi possível carregar usuários." }
  }

  const {
    data: { users },
    error: usersError
  } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 })

  if (usersError) {
    return { success: false, error: "Não foi possível carregar emails." }
  }

  const emailById = new Map(users.map((user) => [user.id, user.email ?? ""]))

  return {
    success: true,
    data: (profiles ?? []).map((profile) => ({
      ...(profile as Profile),
      email: emailById.get(profile.id) ?? "Email não encontrado"
    }))
  }
}


