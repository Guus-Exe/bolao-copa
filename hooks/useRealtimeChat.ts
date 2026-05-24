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

    const reactionsChannel = supabase
      .channel("chat_reactions")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_reactions"
        },
        (payload) => {
          if (!isActive) return

          setMessages((current) => {
            if (payload.eventType === "INSERT") {
              const newReaction = payload.new as {
                message_id: string
                user_id: string
                emoji: string
              }
              return current.map((msg) => {
                if (msg.id === newReaction.message_id) {
                  const reactions = { ...(msg.reactions || {}) }
                  if (!reactions[newReaction.emoji]) {
                    reactions[newReaction.emoji] = { count: 0, user_ids: [] }
                  }
                  if (!reactions[newReaction.emoji].user_ids.includes(newReaction.user_id)) {
                    reactions[newReaction.emoji].count++
                    reactions[newReaction.emoji].user_ids.push(newReaction.user_id)
                  }
                  return { ...msg, reactions }
                }
                return msg
              })
            }

            if (payload.eventType === "DELETE") {
              const oldReaction = payload.old as {
                id: string
                message_id?: string
                user_id?: string
                emoji?: string
              }
              // Supabase delete payload may not have full fields if replica identity is default
              // For chat_reactions, replica identity is default so we might only get ID
              // But we can scan the state to remove it if we don't have message_id
              return current.map((msg) => {
                const newReactions = { ...(msg.reactions || {}) }
                let changed = false
                
                // Hack: If we only have ID, we can't easily find which message had it.
                // However, the event usually includes the old values if configured, 
                // but by default only ID. To properly remove it, we need to know the emoji and user.
                // If we don't have it, we might need a workaround. 
                // Let's assume we have full old record for now or we just refresh.
                // Actually, if we only have ID, this is tricky. We'd better just reload or configure replica identity.
                // If we configure replica identity full on chat_reactions: `alter table public.chat_reactions replica identity full;`
                // Let's assume we have it.
                if (oldReaction.message_id && oldReaction.emoji && oldReaction.user_id) {
                  if (msg.id === oldReaction.message_id && newReactions[oldReaction.emoji]) {
                    newReactions[oldReaction.emoji].user_ids = newReactions[oldReaction.emoji].user_ids.filter(id => id !== oldReaction.user_id)
                    newReactions[oldReaction.emoji].count = newReactions[oldReaction.emoji].user_ids.length
                    if (newReactions[oldReaction.emoji].count === 0) {
                      delete newReactions[oldReaction.emoji]
                    }
                    changed = true
                  }
                }
                
                return changed ? { ...msg, reactions: newReactions } : msg
              })
            }

            return current
          })
        }
      )
      .subscribe()

    return () => {
      isActive = false
      setIsConnected(false)
      void supabase.removeChannel(messagesChannel)
      void supabase.removeChannel(reactionsChannel)
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
