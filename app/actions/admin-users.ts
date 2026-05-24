"use server"

import "server-only"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { supabaseAdmin } from "@/lib/supabase/admin"
import { adminUserToggleSchema } from "@/lib/validations"
import { requireAdmin, type ActionResult, type AdminPrediction } from "@/lib/queries/admin"

const idSchema = z.string().uuid()

function revalidateAdminViews() {
  revalidatePath("/admin")
  revalidatePath("/admin/jogos")
  revalidatePath("/admin/usuarios")
  revalidatePath("/admin/controle")
}

export async function toggleUserAccess(
  userId: string,
  isPaid: boolean
): Promise<ActionResult> {
  const admin = await requireAdmin()

  if (!admin.success) {
    return admin
  }

  const parsed = adminUserToggleSchema.safeParse({ userId, value: isPaid })

  if (!parsed.success) {
    return { success: false, error: "Usuário inválido." }
  }

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ is_paid: parsed.data.value })
    .eq("id", parsed.data.userId)

  if (error) {
    return { success: false, error: "Não foi possível alterar o acesso." }
  }

  revalidatePath("/dashboard")
  revalidatePath("/ranking")
  revalidateAdminViews()

  return { success: true, data: undefined }
}

export async function toggleUserAdmin(
  userId: string,
  isAdmin: boolean
): Promise<ActionResult> {
  const admin = await requireAdmin()

  if (!admin.success) {
    return admin
  }

  const parsed = adminUserToggleSchema.safeParse({ userId, value: isAdmin })

  if (!parsed.success) {
    return { success: false, error: "Usuário inválido." }
  }

  if (admin.data.userId === parsed.data.userId && !parsed.data.value) {
    return {
      success: false,
      error: "Você não pode remover seu próprio acesso admin."
    }
  }

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ is_admin: parsed.data.value })
    .eq("id", parsed.data.userId)

  if (error) {
    return { success: false, error: "Não foi possível alterar admin." }
  }

  revalidateAdminViews()

  return { success: true, data: undefined }
}

export async function deleteUser(userId: string): Promise<ActionResult> {
  const admin = await requireAdmin()

  if (!admin.success) {
    return admin
  }

  const parsed = idSchema.safeParse(userId)

  if (!parsed.success) {
    return { success: false, error: "Usuário inválido." }
  }

  if (admin.data.userId === parsed.data) {
    return { success: false, error: "Você não pode excluir sua própria conta." }
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(parsed.data)

  if (error) {
    return { success: false, error: "Não foi possível excluir o usuário." }
  }

  revalidatePath("/ranking")
  revalidateAdminViews()

  return { success: true, data: undefined }
}

export async function getUserPredictionsForAdmin(
  userId: string
): Promise<ActionResult<AdminPrediction[]>> {
  const admin = await requireAdmin()

  if (!admin.success) {
    return admin
  }

  const parsed = idSchema.safeParse(userId)

  if (!parsed.success) {
    return { success: false, error: "Usuário inválido." }
  }

  const { data, error } = await supabaseAdmin
    .from("predictions")
    .select(
      "*, game:games(home_team, away_team, home_flag, away_flag, home_score, away_score, is_finished, match_date)"
    )
    .eq("user_id", parsed.data)
    .order("created_at", { ascending: false })

  if (error) {
    return { success: false, error: "Não foi possível carregar os palpites." }
  }

  return { success: true, data: (data ?? []) as unknown as AdminPrediction[] }
}
