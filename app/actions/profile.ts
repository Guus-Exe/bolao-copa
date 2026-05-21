"use server"

import { revalidatePath } from "next/cache"

import { supabaseAdmin } from "@/lib/supabase/admin"
import { createServerClient } from "@/lib/supabase/server"
import { usernameSchema } from "@/lib/validations"

type ActionResult<T = void> =
  | { success: true; data: T; error?: never }
  | { success: false; error: string; data?: never }

const AVATAR_BUCKET = "avatars"
const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_AVATAR_SIZE = 2 * 1024 * 1024

export async function updateUsername(
  username: string
): Promise<ActionResult<{ username: string }>> {
  const parsed = usernameSchema.safeParse({ username })

  if (!parsed.success) {
    return { success: false, error: "Informe um apelido valido." }
  }

  const supabase = createServerClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Voce precisa estar logado." }
  }

  const normalizedUsername = parsed.data.username

  // A consulta de disponibilidade usa service_role no servidor porque RLS limita a leitura de outros perfis.
  const { data: existingProfile, error: availabilityError } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("username", normalizedUsername)
    .maybeSingle()

  if (availabilityError) {
    return { success: false, error: "Nao foi possivel verificar o apelido." }
  }

  if (existingProfile && existingProfile.id !== user.id) {
    return { success: false, error: "Este apelido ja esta em uso." }
  }

  const { error } = await (supabase.from("profiles") as any)
    .update({ username: normalizedUsername })
    .eq("id", user.id)

  if (error) {
    return { success: false, error: "Nao foi possivel salvar o apelido." }
  }

  revalidateProfileViews()

  return { success: true, data: { username: normalizedUsername } }
}

export async function updateAvatar(
  formData: FormData
): Promise<ActionResult<{ avatarUrl: string }>> {
  const supabase = createServerClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Voce precisa estar logado." }
  }

  const file = formData.get("avatar")

  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "Selecione uma imagem para enviar." }
  }

  if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
    return { success: false, error: "Envie uma imagem JPG, PNG ou WebP." }
  }

  if (file.size > MAX_AVATAR_SIZE) {
    return { success: false, error: "A imagem precisa ter ate 2MB." }
  }

  // O nome fica preso ao user.id; o client nunca decide o caminho final no bucket.
  const extension = file.type === "image/png" ? "png" : file.type === "image/jpeg" ? "jpg" : "webp"
  const filePath = `${user.id}/avatar.${extension}`

  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(filePath, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: true
    })

  if (uploadError) {
    return { success: false, error: "Nao foi possivel enviar a foto." }
  }

  const {
    data: { publicUrl }
  } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(filePath)
  const avatarUrl = `${publicUrl}?v=${Date.now()}`

  const { error: profileError } = await (supabase.from("profiles") as any)
    .update({ avatar_url: avatarUrl })
    .eq("id", user.id)

  if (profileError) {
    return { success: false, error: "A foto foi enviada, mas o perfil nao foi atualizado." }
  }

  revalidateProfileViews()

  return { success: true, data: { avatarUrl } }
}

function revalidateProfileViews() {
  revalidatePath("/perfil")
  revalidatePath("/ranking")
  revalidatePath("/chat")
  revalidatePath("/", "layout")
}
