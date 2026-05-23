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
    <section className="overflow-hidden rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)]">
      <header className="flex items-center justify-between gap-4 border-b border-[var(--border-strong)] px-4 py-3">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-wide">
            Chat do Bolão
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Converse com os participantes liberados.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-[var(--border-strong)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)]">
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              isConnected ? "bg-green-400" : "bg-zinc-500"
            )}
          />
          {isConnected ? "online" : "conectando"}
        </div>
      </header>

      <div
        ref={listRef}
        className="flex h-[62vh] flex-col gap-3 overflow-y-auto px-3 py-4 md:h-[65vh] md:px-4"
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
