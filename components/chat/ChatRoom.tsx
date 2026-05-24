"use client"

import { useEffect, useRef, useState, useTransition } from "react"

import { sendMessage } from "@/app/actions/chat"
import { ChatInput } from "@/components/chat/ChatInput"
import { MessageBubble } from "@/components/chat/MessageBubble"
import { cn } from "@/lib/utils"
import {
  type ChatMessageWithProfile,
  useRealtimeChat
} from "@/hooks/useRealtimeChat"

type ChatRoomProps = {
  initialMessages: ChatMessageWithProfile[]
  currentUserId: string
  currentUserProfile: {
    username: string
    avatar_url: string | null
  }
  canSend: boolean
}

export function ChatRoom({
  initialMessages,
  currentUserId,
  currentUserProfile,
  canSend
}: ChatRoomProps) {
  const { messages, isConnected, appendMessage } =
    useRealtimeChat(initialMessages)
  const [content, setContent] = useState("")
  const [toast, setToast] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const listRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const shouldStickToBottomRef = useRef(true)

  useEffect(() => {
    if (!shouldStickToBottomRef.current) {
      return
    }

    bottomRef.current?.scrollIntoView({ block: "end" })
  }, [messages])

  function handleScroll() {
    const list = listRef.current

    if (!list) {
      return
    }

    // Mantem o scroll automatico apenas quando o usuario esta perto do fim.
    const distanceFromBottom =
      list.scrollHeight - list.scrollTop - list.clientHeight
    shouldStickToBottomRef.current = distanceFromBottom < 120
  }

  function handleSubmit() {
    const nextContent = content.trim()

    if (!nextContent || isPending || !canSend) {
      return
    }

    shouldStickToBottomRef.current = true

    startTransition(async () => {
      const result = await sendMessage(nextContent)

      if (!result.success) {
        showToast(result.error)
        return
      }

      appendMessage({
        ...result.data,
        profile: currentUserProfile
      })
      setContent("")
    })
  }

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 3200)
  }

  return (
    <section className="relative flex flex-col h-[calc(100dvh-132px)] md:h-[calc(100dvh-146px)] -mt-8 -mx-4 -mb-24 md:-mb-8 overflow-hidden border-t border-green-500/20 bg-black/20">
      {!canSend && (
        <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-4 py-2 text-center">
          <p className="text-sm text-yellow-500/90">
            Você está aguardando liberação de acesso.
          </p>
        </div>
      )}

      {/* Indicador de status (flutuante) */}
      <div className="absolute top-2 right-4 z-10 flex items-center gap-2 rounded-full border border-green-500/20 bg-black/60 px-2 py-1 text-[10px] font-semibold text-green-400 backdrop-blur-md">
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            isConnected ? "bg-green-400" : "bg-zinc-500"
          )}
        />
        {isConnected ? "online" : "conectando"}
      </div>

      <div
        ref={listRef}
        className="flex-1 flex flex-col gap-4 overflow-y-auto px-3 py-4 md:px-5 scroll-smooth"
        onScroll={handleScroll}
      >
        {messages.length > 0 ? (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwnMessage={message.user_id === currentUserId}
            />
          ))
        ) : (
          <div className="flex flex-1 items-center justify-center text-center text-sm text-[var(--text-secondary)]">
            Nenhuma mensagem ainda. Seja o primeiro a puxar assunto.
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <ChatInput
        value={content}
        isSending={isPending}
        canSend={canSend}
        onChange={setContent}
        onSubmit={handleSubmit}
      />

      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg border border-red-500/30 bg-red-500/15 px-4 py-3 text-sm font-semibold text-red-200 shadow-lg">
          {toast}
        </div>
      ) : null}
    </section>
  )
}
