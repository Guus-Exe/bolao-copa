import { ChatRoom } from "@/components/chat/ChatRoom"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { createServerClient } from "@/lib/supabase/server"
import type { ChatMessageWithProfile } from "@/types"

export default async function ChatPage() {
  const supabase = createServerClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

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

  const { data: messagesData } = await supabase
    .from("chat_messages")
    .select("id, content, created_at, user_id")
    .order("created_at", { ascending: false })
    .limit(50)

  const messages = ((messagesData ?? []) as ChatMessageRow[]).reverse()
  const userIds = Array.from(new Set(messages.map((message) => message.user_id)))

  // Carrega os perfis publicos no servidor para nao depender da RLS do client.
  const { data: profilesData } = userIds.length
    ? await supabaseAdmin
        .from("profiles")
        .select("id, username, avatar_url")
        .in("id", userIds)
    : { data: [] }

  const profilesById = new Map(
    ((profilesData ?? []) as ProfileRow[]).map((item) => [item.id, item])
  )

  const initialMessages = messages.map((message) => {
    const messageProfile = profilesById.get(message.user_id)

    return {
      id: message.id,
      user_id: message.user_id,
      content: message.content,
      created_at: message.created_at,
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

type ChatMessageRow = {
  id: string
  user_id: string
  content: string
  created_at: string
}

type ProfileRow = {
  id: string
  username: string
  avatar_url: string | null
}
