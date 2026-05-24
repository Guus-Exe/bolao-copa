"use client"

import { useEffect, useMemo, useState } from "react"

import { getChatProfile } from "@/app/actions/chat"
import { createClient } from "@/lib/supabase/client"
import type { ChatMessage, ChatMessageWithProfile } from "@/types"

type LegacyChatMessageWithProfile = ChatMessage & {
  profile: {
    username: string
    avatar_url: string | null
  }
}

export type { ChatMessageWithProfile }

export function useRealtimeChat(initialMessages: ChatMessageWithProfile[]) {
  const supabase = useMemo(() => createClient(), [])
  const [messages, setMessages] =
    useState<ChatMessageWithProfile[]>(initialMessages)
  const [isConnected, setIsConnected] = useState(false)

  function appendMessage(
    message: ChatMessageWithProfile | LegacyChatMessageWithProfile
  ) {
    const normalizedMessage = normalizeMessage(message)

    setMessages((current) => {
      if (current.some((item) => item.id === normalizedMessage.id)) {
        return current
      }

      return [...current, normalizedMessage]
    })
  }

  useEffect(() => {
    let isActive = true

    const messagesChannel = supabase
      .channel("chat_messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages"
        },
        async (payload) => {
          const newMessage = payload.new as ChatMessage

          // O Realtime entrega apenas chat_messages; o perfil vem do servidor.
          const profileResult = await getChatProfile(newMessage.user_id)

          if (!isActive) {
            return
          }

          const profiles = profileResult.success
            ? profileResult.data
            : {
                username: "usuario",
                avatar_url: null
              }

          appendMessage({
            ...newMessage,
            profiles
          })
        }
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED")
      })

    return () => {
      isActive = false
      setIsConnected(false)
      void supabase.removeChannel(messagesChannel)
    }
  }, [supabase])

  return { messages, isConnected, appendMessage }
}

function normalizeMessage(
  message: ChatMessageWithProfile | LegacyChatMessageWithProfile
): ChatMessageWithProfile {
  if ("profiles" in message) {
    return message
  }

  // Mantem compatibilidade com a mensagem otimista enviada pelo ChatRoom.
  return {
    id: message.id,
    content: message.content,
    created_at: message.created_at,
    user_id: message.user_id,
    profiles: message.profile
  }
}
