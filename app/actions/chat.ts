"use server"

import { createServerClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { chatMessageSchema } from "@/lib/validations"
import type { ChatMessage } from "@/types"
import { z } from "zod"

type ActionResult<T = void> =
  | { success: true; data: T; error?: never }
  | { success: false; error: string; data?: never }

const userIdSchema = z.string().uuid()
const messageIdSchema = z.string().uuid()
const emojiSchema = z.string().min(1).max(10) // Em caso de emojis compostos

export async function sendMessage(
  content: unknown
): Promise<ActionResult<ChatMessage>> {
  const parsed = chatMessageSchema.safeParse({ content })

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Mensagem inválida."
    }
  }

  const sanitizedContent = sanitizeMessage(parsed.data.content)
  const sanitized = chatMessageSchema.safeParse({ content: sanitizedContent })

  if (!sanitized.success) {
    return { success: false, error: "Digite uma mensagem válida." }
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
    .select("is_paid")
    .eq("id", user.id)
    .single()
  const profile = profileData as { is_paid: boolean } | null

  if (!profile?.is_paid) {
    return { success: false, error: "Seu acesso ainda não foi liberado." }
  }

  // Usa supabaseAdmin para inferencia de tipos correta; autenticacao ja foi validada acima.
  const { data, error } = await supabaseAdmin
    .from("chat_messages")
    .insert({
      user_id: user.id,
      content: sanitized.data.content
    })
    .select("*")
    .single()

  if (error || !data) {
    return { success: false, error: "Não foi possível enviar a mensagem." }
  }

  return { success: true, data: data as ChatMessage }
}

export async function getChatProfile(
  userId: unknown
): Promise<ActionResult<{ username: string; avatar_url: string | null }>> {
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

  const { data: requesterData } = await supabase
    .from("profiles")
    .select("is_paid")
    .eq("id", user.id)
    .single()
  const requester = requesterData as { is_paid: boolean } | null

  if (!requester?.is_paid) {
    return { success: false, error: "Seu acesso ainda não foi liberado." }
  }

  // Busca server-side para nao depender da RLS de profiles no client.
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("username, avatar_url")
    .eq("id", parsed.data)
    .single()

  if (error || !data) {
    return { success: false, error: "Perfil não encontrado." }
  }

  return {
    success: true,
    data: {
      username: data.username,
      avatar_url: data.avatar_url
    }
  }
}

function sanitizeMessage(content: string) {
  // Remove tags HTML antes de salvar para manter o chat apenas com texto.
  return content.replace(/<[^>]*>/g, "").trim()
}

export async function toggleReaction(
  messageId: unknown,
  emoji: unknown
): Promise<ActionResult> {
  const parsedMessageId = messageIdSchema.safeParse(messageId)
  const parsedEmoji = emojiSchema.safeParse(emoji)

  if (!parsedMessageId.success || !parsedEmoji.success) {
    return { success: false, error: "Dados inválidos para reação." }
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
    .select("is_paid")
    .eq("id", user.id)
    .single()
  const profile = profileData as { is_paid: boolean } | null

  if (!profile?.is_paid) {
    return { success: false, error: "Seu acesso ainda não foi liberado." }
  }

  // Remove todas as reações atuais do usuário nesta mensagem
  const { data: deletedReactions, error: deleteError } = await supabaseAdmin
    .from("chat_reactions")
    .delete()
    .eq("message_id", parsedMessageId.data)
    .eq("user_id", user.id)
    .select("emoji")

  if (deleteError) {
    return { success: false, error: "Não foi possível atualizar a reação." }
  }

  // Se o usuário já tinha apenas essa mesma reação (e mais nenhuma), não inserimos de novo (toggle off)
  if (
    deletedReactions &&
    deletedReactions.length === 1 &&
    deletedReactions[0].emoji === parsedEmoji.data
  ) {
    return { success: true, data: undefined }
  }

  // Insere a nova reação (substituindo todas as antigas, se havia)
  const { error: insertError } = await supabaseAdmin
    .from("chat_reactions")
    .insert({
      message_id: parsedMessageId.data,
      user_id: user.id,
      emoji: parsedEmoji.data
    })

  if (insertError) {
    return { success: false, error: "Não foi possível adicionar a reação." }
  }

  return { success: true, data: undefined }
}
