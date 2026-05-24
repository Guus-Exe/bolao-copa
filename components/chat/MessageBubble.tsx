"use client"

import { cn } from "@/lib/utils"
import type { ChatMessageWithProfile } from "@/types"

import { toggleReaction } from "@/app/actions/chat"
import { useTransition, useState, useRef, useEffect } from "react"
import { SmilePlus } from "lucide-react"

type MessageBubbleProps = {
  message: ChatMessageWithProfile
  isOwnMessage: boolean
  currentUserId: string
}

export function MessageBubble({
  message,
  isOwnMessage,
  currentUserId
}: MessageBubbleProps) {
  const [isPending, startTransition] = useTransition()
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const pressTimer = useRef<NodeJS.Timeout | null>(null)

  function handleTouchStart() {
    pressTimer.current = setTimeout(() => {
      setShowMobileMenu(true)
    }, 400)
  }

  function handleTouchEnd() {
    if (pressTimer.current) clearTimeout(pressTimer.current)
  }

  useEffect(() => {
    function handleGlobalClick() {
      if (showMobileMenu) setShowMobileMenu(false)
    }
    // Usamos setTimeout para não fechar no mesmo evento de touch que abre
    const timeoutId = setTimeout(() => {
      document.addEventListener("click", handleGlobalClick)
      document.addEventListener("touchstart", handleGlobalClick)
    }, 10)
    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener("click", handleGlobalClick)
      document.removeEventListener("touchstart", handleGlobalClick)
    }
  }, [showMobileMenu])

  // As mensagens usam o profile aninhado vindo do join ou da busca pos-Realtime.
  const username = message.profiles?.username ?? "usuário"
  const avatarUrl = message.profiles?.avatar_url ?? null

  return (
    <div
      className={cn(
        "group flex w-full items-end gap-2 relative select-none",
        isOwnMessage ? "justify-end" : "justify-start"
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchEnd}
    >
      {/* Menu de Quick Reactions */}
      <div
        className={cn(
          "absolute bottom-full mb-1 flex items-center gap-1 rounded-full border border-green-500/20 bg-zinc-900/90 px-2 py-1 shadow-lg transition-opacity z-10",
          isOwnMessage ? "right-8" : "left-8",
          showMobileMenu 
            ? "opacity-100 pointer-events-auto" 
            : "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto"
        )}
      >
        {["👍", "❤️", "😂", "😮", "😢"].map((emoji) => (
          <button
            key={emoji}
            disabled={isPending}
            onClick={(e) => {
              e.stopPropagation() // Evita fechar o menu na hora do click
              setShowMobileMenu(false)
              startTransition(async () => {
                await toggleReaction(message.id, emoji)
              })
            }}
            className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-zinc-800 transition-colors text-sm hover:scale-125 disabled:opacity-50"
          >
            {emoji}
          </button>
        ))}
      </div>
      {!isOwnMessage ? (
        <MessageAvatar username={username} url={avatarUrl} />
      ) : null}

      <article
        className={cn(
          "max-w-[82%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm shadow-md md:max-w-[68%] backdrop-blur-sm",
          isOwnMessage
            ? "rounded-br-sm border border-green-400/20 bg-green-500/10 text-green-50"
            : "rounded-bl-sm border border-zinc-700/50 bg-zinc-800/80 text-zinc-100"
        )}
      >
        <div
          className={cn(
            "mb-1 flex items-center gap-2",
            isOwnMessage ? "justify-end" : "justify-start"
          )}
        >
          <span className="text-xs font-semibold text-green-400">
            {username}
          </span>
        </div>
        <p className="leading-relaxed">
          {message.content}
        </p>
        <time className={cn(
          "mt-2 block text-right text-[10px] font-medium",
          isOwnMessage ? "text-green-200/60" : "text-zinc-400"
        )}>
          {formatMessageTime(message.created_at)}
        </time>
      </article>

      {/* Badges de Reações */}
      {message.reactions && Object.keys(message.reactions).length > 0 && (
        <div className={cn(
          "absolute -bottom-4 flex items-center gap-1",
          isOwnMessage ? "right-10 flex-row-reverse" : "left-10"
        )}>
          {Object.entries(message.reactions).map(([emoji, data]) => {
            const hasReacted = data.user_ids.includes(currentUserId)
            return (
              <button
                key={emoji}
                onClick={() => {
                  startTransition(async () => {
                    await toggleReaction(message.id, emoji)
                  })
                }}
                className={cn(
                  "flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] shadow-sm backdrop-blur-sm transition-colors",
                  hasReacted 
                    ? "border-green-500/40 bg-green-500/20 text-green-300"
                    : "border-zinc-700/50 bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700"
                )}
              >
                <span>{emoji}</span>
                <span className="font-semibold">{data.count}</span>
              </button>
            )
          })}
        </div>
      )}

      {isOwnMessage ? (
        <MessageAvatar username={username} url={avatarUrl} />
      ) : null}
    </div>
  )
}

function MessageAvatar({
  username,
  url
}: {
  username: string
  url: string | null
}) {
  const initials = username.slice(0, 2).toUpperCase()
  const backgroundColor = getAvatarColor(username)

  if (url) {
    return (
      <div
        aria-label={`Avatar de ${username}`}
        className="h-6 w-6 shrink-0 rounded-full bg-cover bg-center ring-1 ring-[var(--border-strong)]"
        role="img"
        style={{ backgroundImage: `url(${url})` }}
      />
    )
  }

  return (
    <div
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ring-1 ring-white/10"
      style={{ backgroundColor }}
    >
      {initials}
    </div>
  )
}

function getAvatarColor(username: string) {
  const colors = [
    "#16a34a",
    "#0f766e",
    "#2563eb",
    "#7c3aed",
    "#db2777",
    "#ca8a04"
  ]
  const index = username
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0)

  return colors[index % colors.length]
}

function formatMessageTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value))
}
