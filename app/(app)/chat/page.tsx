import { ChatRoom } from "@/components/chat/ChatRoom"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { createServerClient } from "@/lib/supabase/server"
import type { ChatMessageWithProfile } from "@/types"

export default async function ChatPage() {
  const supabase = createServerClient()

  // Executa o getUser e a busca de mensagens com perfis em paralelo (Passo 1)
  const [userResult, messagesResult] = await Promise.all([
    supabase.auth.getUser(),
    supabaseAdmin
      .from("chat_messages")
      .select("id, content, created_at, user_id, profiles(username, avatar_url)")
      .order("created_at", { ascending: false })
      .limit(50)
  ])

  const user = userResult.data.user

  // Busca o perfil do usuário logado (Passo 2)
  const { data: profileData } = await supabase
    .from("profiles")
    .select("username, avatar_url, is_paid")
    .eq("id", user?.id ?? "")
    .single()

  const profile = profileData as {
    username: string
    avatar_url: string | null
    is_paid: boolean
  } | null

  const rawMessages = messagesResult.data ?? []

  // Mapeia e reverte as mensagens para ordem cronológica crescente
  const initialMessages: ChatMessageWithProfile[] = rawMessages
    .slice()
    .reverse()
    .map((msg) => {
      const messageProfile = Array.isArray(msg.profiles)
        ? msg.profiles[0]
        : msg.profiles

      return {
        id: msg.id,
        user_id: msg.user_id,
        content: msg.content,
        created_at: msg.created_at,
        profiles: messageProfile
          ? {
              username: messageProfile.username,
              avatar_url: messageProfile.avatar_url
            }
          : null
      }
    })

  return (
    <ChatRoom
      initialMessages={initialMessages}
      currentUserId={user?.id ?? ""}
      currentUserProfile={{
        username: profile?.username ?? "participante",
        avatar_url: profile?.avatar_url ?? null
      }}
      canSend={Boolean(profile?.is_paid)}
    />
  )
}

